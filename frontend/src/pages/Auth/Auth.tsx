// src/pages/Auth/Auth.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Input } from "../../components/Auth/Input";
import { Button } from "../../components/Auth/Button";

type AuthMode = "login" | "register" | "resetRequest" | "resetConfirm";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();

  // Set initial mode based on URL
  useEffect(() => {
    if (location.pathname.includes("reset-password") && token) {
      setMode("resetConfirm");
    }
  }, [location, token]);

  //console.log("LocalToken in auth", localStorage.getItem("token"));
  //console.log("SessionToken in auth", sessionStorage.getItem("token"));

  useEffect(() => {
    const storedRememberMe = JSON.parse(
      localStorage.getItem("rememberMe") || "false"
    );
    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");

    setRememberMe(storedRememberMe);

    if (storedRememberMe && storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      let endpoint;
      let body;
  
      switch (mode) {
        case "login":
          endpoint = "login";
          body = { email, password };
          break;
        case "register":
          endpoint = "register";
          body = { email, password, username };
          break;
        case "resetRequest":
          endpoint = "reset-password/request";
          body = { email, securityQuestion };
          break;
        case "resetConfirm":
          const savedToken = localStorage.getItem("resetToken");
          if (!savedToken) {
            setErrorMessage(
              "No token found. Please request a password reset again."
            );
            return;
          }
          if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
          }
          endpoint = "reset-password/confirm";
          body = { token: savedToken, newPassword };
          break;
      }
  
      const response = await fetch(`http://localhost:8080/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (mode === "resetRequest") {
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("resetToken", data.token);
          setSuccessMessage("Redirecting...");
          setTimeout(() => {
            switchMode("resetConfirm");
            navigate("/reset-password/confirm");
          }, 2000);
        } else {
          setErrorMessage(data.message || "Something went wrong");
        }
        return;
      }
  
      if (mode === "resetConfirm") {
        const textResponse = await response.text();
        if (response.ok) {
          setSuccessMessage("Password reset successful!");
          setTimeout(() => {
            switchMode("login");
            navigate("/login");
          }, 2000);
        } else {
          setErrorMessage(textResponse || "Failed to reset password");
        }
        return;
      }
  
      const data = await response.json();
      //console.log("Response data:", data); // Debug log
  
      if (response.ok) {
        switch (mode) {
          case "register":
            setSuccessMessage(
              "Registration successful! Redirecting to login..."
            );
            setTimeout(() => {
              switchMode("login");
            }, 2000);
            break;
          case "login":
            if (!data.token) {
              setErrorMessage("No token received from server");
              return;
            }
  
            //console.log(
              //"LocalToken in auth before",
              //localStorage.getItem("token")
            //);
            //console.log(
              //"SessionToken in auth before",
              //sessionStorage.getItem("token")
            //);
  
            // Clear any existing tokens first
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
  
            //console.log(
              //"LocalToken in auth after",
              //localStorage.getItem("token")
            //);
            //console.log(
              //"SessionToken in auth after",
              //sessionStorage.getItem("token")
            //);
  
            if (rememberMe) {
              sessionStorage.setItem("token", data.token);
              localStorage.setItem("userEmail", email);
              localStorage.setItem("userPassword", password);
              localStorage.setItem("rememberMe", JSON.stringify(true));
            } else {
              sessionStorage.setItem("token", data.token);
              localStorage.removeItem("userEmail");
              localStorage.removeItem("userPassword");
              localStorage.setItem("rememberMe", JSON.stringify(false));
            }
  
            if (data.userId) {
              localStorage.setItem("userId", data.userId.toString());
            }
            
            // Add a small delay to ensure token is set before navigation
            setTimeout(() => {
             // console.log("Navigating to:", data.isProfileComplete ? "/home" : "/profile");
              navigate(data.isProfileComplete ? "/home" : "/profile", {
                replace: true,
              });
            }, 100);
            break;
        }
      } else {
        setErrorMessage(data.message || "An error occurred");
      }
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      setErrorMessage("An error occurred. Please try again.");
    }
    //console.log("LocalToken in auth last", localStorage.getItem("token"));
    //console.log("SessionToken in auth last", sessionStorage.getItem("token"));
  };

  const switchMode = (newMode: AuthMode) => {
    setIsAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
      setErrorMessage("");
      setSuccessMessage("");
      setEmail("");
      setUserName("");
      setPassword("");
      setSecurityQuestion("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
  };

  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <>
            <Input
              label="Email"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="flex justify-between items-center mb-6 animate-fadeIn">
              <div className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 accent-[#b085f5] cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    //console.log("Remember Me:", isChecked);
                    setRememberMe(isChecked);
                    localStorage.setItem(
                      "rememberMe",
                      JSON.stringify(isChecked)
                    ); 
                  }}
                />
                <label className="text-sm text-[#b4b4c7] cursor-pointer group-hover:text-[#b085f5] transition-colors">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => switchMode("resetRequest")}
                className="text-sm text-[#b085f5] hover:text-[#c49fff] transition-all duration-300"
              >
                Forgot Password?
              </button>
            </div>
          </>
        );

      case "register":
        return (
          <>
            <Input
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
            />
            <Input
              label="Email"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
            />
          </>
        );

      case "resetRequest":
        return (
          <>
            <Input
              label="Email"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <Input
              label="Security Word"
              id="security"
              type="text"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder="Enter your security word"
            />
          </>
        );

      case "resetConfirm":
        return (
          <>
            <Input
              label="New Password"
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm Password"
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-[#1a1b26] p-5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#b085f5] rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#b085f5] rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="bg-[#272735] p-8 md:p-10 rounded-xl w-full max-w-md shadow-xl overflow-hidden relative backdrop-blur-sm border border-[#383850]/30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="relative">
          <div className="text-center mb-12 transform transition-all duration-500">
            <div className="text-[#b085f5] text-3xl md:text-4xl font-semibold tracking-tight mb-2 hover:scale-105 transition-transform">
              kood/Sisu
            </div>
            <div className="text-[#b085f5] text-lg opacity-90">
              {mode === "resetRequest" || mode === "resetConfirm"
                ? "Reset Password"
                : "Buddy Finder"}
            </div>
          </div>

          <div
            className={`transform transition-all duration-500 ease-out ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">{renderForm()}</div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <Button type="submit">
                  {mode === "login"
                    ? "Log In"
                    : mode === "register"
                    ? "Register"
                    : mode === "resetRequest"
                    ? "Reset Password"
                    : "Confirm Reset"}
                </Button>
              </div>

              <div className="text-center text-sm text-[#b4b4c7] mt-6">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-[#b085f5] hover:text-[#c49fff] transition-all duration-300 relative group"
                    >
                      <span className="relative z-10">Register</span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b085f5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </button>
                  </>
                ) : (
                  <>
                    Back to{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-[#b085f5] hover:text-[#c49fff] transition-all duration-300 relative group"
                    >
                      <span className="relative z-10">Login</span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b085f5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="mt-6 transition-all duration-300">
              {errorMessage && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-center text-sm animate-fadeIn">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-center text-sm animate-fadeIn">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
