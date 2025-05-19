// src/pages/AdminPanel.tsx
import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useUserStore } from "../store/userStore";

const GET_PENDING_USERS = gql`
  query PendingUsers {
    pendingUsers {
      id
      email
      displayName
      createdAt
    }
  }
`;

const APPROVE_USER = gql`
  mutation ApproveUser($id: ID!) {
    approveUser(id: $id) {
      id
      email
      isActive
    }
  }
`;

const AdminPanel: React.FC = () => {
  const { user, clearUser } = useUserStore();
  const [approveUser] = useMutation(APPROVE_USER);
  const { loading, error, data, refetch } = useQuery(GET_PENDING_USERS);
  if (!user) {
    clearUser();
    window.location.href = "/signin";
    return null;
  }
  const handleApprove = async (id: string) => {
    await approveUser({ variables: { id } });
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  console.log(data)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <h2 className="text-xl mb-4">Pending Users</h2>
      <ul className="space-y-4">
        {data.pendingUsers.map((user: any) => (
          <li
            key={user.id}
            className="p-4 border rounded shadow flex justify-between"
          >
            <div>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Registered:</strong>{" "}
                {new Date(Number(user.createdAt)).toLocaleDateString()} - {new Date(Number(user.createdAt)).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => handleApprove(user.id)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
