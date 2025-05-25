import { useMutation } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { CHAT_MUTATION } from "../graphql/mutations/chatMutation";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faFilePdf,
  faFileText,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import { uploadDocument } from "../services/api";
import { AttachedFileType } from "../types/chat";

export type Message = {
  isUser: boolean;
  content: string;
};

const HomePage: React.FC = () => {
  const { user, clearUser, addUserChatHistory } = useUserStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chat] = useMutation(CHAT_MUTATION);
  const navigate = useNavigate();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileType[]>([]);

  const loadingMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      clearUser();
      window.location.href = "/signin";
    }
  }, [user, clearUser]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { isUser: true, content: input };
    setLoading(true);

    if (loadingMessageRef.current) {
      (loadingMessageRef.current as HTMLDivElement).style.display = "block";
    }

    try {
      const res = await chat({
        variables: {
          message: input,
        },
      });

      const botMessage: Message = {
        content: res.data.chat.aiResponse,
        isUser: false,
      };
      addUserChatHistory({
        id: res.data.chat.sessionId,
        messages: [userMessage, botMessage],
      });
      navigate(`/chat?c=${res.data.chat.sessionId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      alert(errorMessage);
      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
    }
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
        const response = await uploadDocument(file, "");
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeText,
            id: response.documentId,
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

  return (
    <div className="bg-gray-100 flex flex-col h-screen items-center justify-center">
      <div className="bg-white max-w-[700px] p-4 w-full">
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
                  onClick={(e) =>
                    setAttachedFiles((prev) =>
                      prev.filter((file, i) => i !== index)
                    )
                  }
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
      </div>
    </div>
  );
};

export default HomePage;
