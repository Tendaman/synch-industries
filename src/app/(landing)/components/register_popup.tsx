//src\app\(landing)\components\register_popup.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterPopup: React.FC<RegisterPopupProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", surname: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
        try {
        data = await response.json();
        } catch (error) {
        data = null;
        }

      if (response.status === 409) {
        setMessage("User already registered. Please use a different email.");
        return;
      }

      if (response.ok) {
        setMessage("Verification email sent. Please check your email. If not there please check spam.");
      } else {
        setMessage(data.message || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="p-6 w-96 bg-white rounded-xl shadow-lg">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Register</h2>

          {message && (
            <div className="flex flex-col bg-gray-100 text-blue-700 p-3 rounded-md mb-4">
              {message}
              <Button className="text-black mt-3" variant="outline" onClick={() => setMessage(null)}>Close</Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" name="surname" type="text" value={formData.surname} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="flex justify-between mt-4">
              <Button type="submit" disabled={loading}>{loading ? "Registering..." : "Submit"}</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPopup;
