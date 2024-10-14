import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "../ui/button";
import { useUser } from "@/app/Context/UserContext";
import { RiAccountCircleLine } from "react-icons/ri";
export const LogoutButton = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  return (
    <Button className="w-full" onClick={handleLogout}>
      Logout
    </Button>
  );
};

const ConnectButton = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // To toggle between login and registration forms
  const user = useUser(); // Get the user from the context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Registration successful! Check your email to confirm.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage(""); // Clear any previous messages when closing the modal
  };

  // Automatically open modal if the user is not logged in
  useEffect(() => {
    if (!user) {
      openModal();
    }
  }, [user]);

  return (
    <>
      {user ? (
        <RiAccountCircleLine
          onClick={openModal}
          className="size-8"
        ></RiAccountCircleLine>
      ) : (
        <Button onClick={openModal}>Login </Button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-96 rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>

            {user ? (
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-700">
                  User Details
                </h3>
                <p>Email: {user.email}</p>
                <p>Last Sign-In: {user.last_sign_in_at}</p>

                <LogoutButton />
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-bold text-gray-700">
                  {isRegistering ? "Sign Up" : "Login"}
                </h3>
                <form
                  onSubmit={isRegistering ? handleRegistration : handleLogin}
                >
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-gray-700"
                    >
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    />
                  </div>

                  {isRegistering && (
                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-bold text-gray-700"
                      >
                        Password:
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                      />
                    </div>
                  )}

                  <Button className="w-full" type="submit">
                    {isRegistering ? "Sign Up" : "Login"}
                  </Button>
                  {message && (
                    <p className="mt-4 text-sm text-gray-600">{message}</p>
                  )}
                </form>
                <p className="mt-4 text-sm text-gray-600">
                  {isRegistering
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? "Login" : "Sign Up"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectButton;
