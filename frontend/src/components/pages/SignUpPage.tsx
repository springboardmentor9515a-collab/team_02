import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Page, UserData } from "@/types";
import { authAPI, setAuthToken } from "@/lib/api";

interface SignUpPageProps {
  onNavigate: (page: Page) => void;
  onSignUp: (user: UserData) => void;
}

export default function SignUpPage({ onNavigate, onSignUp }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // ✅ Added role
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.role) {
      alert("Please select a role!");
      return;
    }

    // Call backend register endpoint
    (async () => {
      try {
        const payload = {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        const res = await authAPI.register(payload);
        // backend returns { token }
        if (res?.token) {
          // store token and user in localStorage and set auth header
          setAuthToken(res.token);
          const user: UserData = {
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role as "admin" | "volunteer" | "citizen",
            token: res.token,
          };
          localStorage.setItem('user', JSON.stringify(user));
          // notify parent (which will call login and navigate to dashboard)
          onSignUp(user);
        } else {
          alert('Registration failed');
        }
      } catch (err: any) {
        alert(err?.response?.data?.error || err?.message || 'Registration failed');
      }
    })();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1604420022249-87e637722439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXZpYyUyMGVuZ2FnZW1lbnQlMjBoYW5kcyUyMHJhaXNlZCUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTg3MTgzMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      />
      <div
        className="absolute inset-0 opacity-95"
        style={{ background: "linear-gradient(180deg, #F5DEB3, #E6CBA8)" }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("landing")}
              className="text-civix-dark-brown hover:bg-civix-dark-brown/10 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent"
              style={{ fontWeight: "700" }}
            >
              Civix
            </h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center space-y-2">
                <CardTitle
                  className="text-3xl text-civix-dark-brown"
                  style={{ fontWeight: "700" }}
                >
                  Create Your Account
                </CardTitle>
                <CardDescription
                  className="text-lg text-civix-dark-brown/70"
                  style={{ fontWeight: "400" }}
                >
                  Join Civix and start making change today.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-civix-dark-brown">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-civix-dark-brown">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-civix-dark-brown">
                      Select Role
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-civix-civic-green bg-white"
                    >
                      <option value="">Choose your role</option>
                      <option value="citizen">Citizen</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-civix-dark-brown">
                      Create Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-civix-dark-brown">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity"
                    style={{ fontWeight: "600" }}
                  >
                    Sign Up
                  </Button>
                </form>

                {/* Login Redirect */}
                <div className="mt-6 text-center text-sm">
                  <p className="text-civix-dark-brown/70">
                    Already have an account?{" "}
                    <button
                      onClick={() => onNavigate("login")}
                      className="text-civix-civic-green hover:underline"
                      style={{ fontWeight: "600" }}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
