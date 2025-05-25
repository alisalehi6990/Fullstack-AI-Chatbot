import { useMutation } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CHAT_MUTATION } from "../graphql/mutations/chatMutation";
import { useUserStore } from "../store/userStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Message } from "./Home";
import {
  faClose,
  faFilePdf,
  faFileText,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import { removeDocument, uploadDocument } from "../services/api";
import { AttachedFileType } from "../types/chat";

const Chat: React.FC = () => {
  const { user, clearUser } = useUserStore();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get("c") || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiTyping, setAiTyping] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileType[]>([]);

  const [chat] = useMutation(CHAT_MUTATION);
  const navigate = useNavigate();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loadingMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sessionIdInParam = searchParams.get("c");
    if (sessionIdInParam && sessionId !== sessionIdInParam) {
      setSessionId(sessionIdInParam);
      return;
    }
    if (!sessionId) {
      navigate("/");
    }
    const existingChat = user!.chatHistories?.find(
      (chat) => chat.id === sessionId
    );
    if (existingChat) {
      setMessages(existingChat.messages);
      scrollToBottom();
    } else {
      navigate("/");
    }
    scrollToBottom();
  }, [user, sessionId, clearUser, searchParams, navigate]);

  const handleSend = async () => {
    if (!input.trim() || aiTyping) return;

    const userMessage: Message = { isUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    scrollToBottom();

    try {
      if (streaming) {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:4000/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: input,
            sessionId,
            documents: attachedFiles.map((file) => file.id),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream failed");
        }
        setLoading(false);
        setAiTyping(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";
        const botMessage: Message = {
          content: "",
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk
            .split("\n")
            .filter((line: string) => line.startsWith("data: "));

          for (const line of lines) {
            const jsonStr = line.replace("data: ", "").trim();
            const parsed = JSON.parse(jsonStr);
            aiResponse += parsed.content;
            botMessage.content = aiResponse;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = botMessage;
              return updatedMessages;
            });
            scrollToBottom();
          }
        }
        setAiTyping(false);
      } else {
        if (loadingMessageRef.current) {
          (loadingMessageRef.current as HTMLDivElement).style.display = "block";
        }
        scrollToBottom();
        const res = await chat({
          variables: {
            message: input,
            sessionId,
            documents: attachedFiles.map((file) => file.id),
          },
        });

        const botMessage: Message = {
          content: res.data.chat.aiResponse,
          isUser: false,
        };

        setMessages((prev) => [...prev, botMessage]);
        if (sessionId === "") {
          setSessionId(res.data.chat.sessionId);
          searchParams.set("c", res.data.chat.sessionId);
        }
      }
      scrollToBottom();
      setAttachedFiles([]);
      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let size = Math.round(file.size / 1000); // KB
      let sizeText = `${size} KB`;
      if (size >= 2000) {
        console.log("File is bigger than 2MB, rejected!!!");
        return;
      }
      if (size >= 1000) {
        size = Math.round(size / 10) / 100;
        sizeText = `${size} MB`;
      }

      try {
        const response = await uploadDocument(file, sessionId);
        setAttachedFiles((prev) => [
          ...prev,
          {
            sizeText,
            id: response.documentId,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        ]);
        e.target.value = "";
        console.log("File documentId:", response.documentId);
      } catch (error: any) {
        console.error("Error uploading file:", error.message);
        e.target.value = "";
      }
    }
  };

  const handleRemoveAttachement = async (index: number) => {
    const document = attachedFiles[index];
    await removeDocument(document.id);
    setAttachedFiles((prev) => prev.filter((file, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-md ${
              msg.isUser
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white text-gray-800 shadow"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div
          ref={loadingMessageRef}
          className={`p-3 rounded-lg max-w-md bg-white text-gray-800 shadow ${
            loading ? "flex" : "hidden"
          }`}
        >
          ...
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        {attachedFiles && attachedFiles.length > 0 && (
          <div className="flex mb-4 space-x-2 w-full">
            {attachedFiles.map((file, index) => (
              <button
                key={index}
                className="group relative h-[56px] pl-1.5 pr-1.5 w-[17rem] flex items-center bg-white dark:bg-[#1A1A1A] border border-[#E8EAF2] dark:border-[#424554] text-left border border-[#E8EAF1] dark:border-none rounded-xl"
                type="button"
              >
                <div
                  className={`flex size-[44px] items-center justify-center rounded-lg text-white ${
                    file.type === "application/pdf"
                      ? "bg-[#DE5A5E]"
                      : "bg-[#61B6ED]"
                  }`}
                >
                  <div className="flex size-[44px] items-center justify-center">
                    {file.type === "application/pdf" ? (
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="h-8  w-full"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faFileText}
                        className="h-8  w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col justify-center -space-y-0.5 px-2">
                  <div className="flex mb-1 text-sm font-medium dark:text-gray-100">
                    <div className="line-clamp-1">
                      {file.name.split(".")[0]}
                    </div>
                    <div className="break-keep">.{file.name.split(".")[1]}</div>
                  </div>
                  <div className="line-clamp-1 flex justify-between text-xs text-gray-500">
                    <span className="capitalize !m-0">{file.sizeText}</span>
                  </div>
                </div>
                <div
                  className="absolute bg-white flex group-hover:visible items-center justify-center right-[6px] rounded-full size-[14px] top-[6px] invisible group-hover:visible"
                  onClick={() => handleRemoveAttachement(index)}
                >
                  <FontAwesomeIcon icon={faClose} />
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={faPaperclip}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer fa-paperclip h-[20px] mx-0 svg-inline--fa w-[18px]"
          />

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf, .txt"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e)}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:outline-none"
          />
          <button
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSend}
          >
            Send
          </button>
        </div>

        <div className="flex w-full mt-2">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="">Enable Streaming</label>
        </div>
      </div>
    </div>
  );
};

export default Chat;
