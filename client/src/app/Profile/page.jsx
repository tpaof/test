"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Twitter } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AccountPage() {
  const [profileImage, setProfileImage] = useState("/avatar.jpeg");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phonePrefix: "+",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedData = localStorage.getItem("accountData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "ชื่ออะไรเอ่ยย";
    if (!formData.lastName.trim()) newErrors.lastName = "คุณลืมใส่นามสกุล";
    if (!formData.email.includes("@")) {
      newErrors.email = "ใส่ @ ด้วยนะ";
    } else if ((formData.email.match(/@/g) || []).length > 1) {
      newErrors.email = "ใส่ @ ใส่ตัวเดียวพอ";
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "อยากติดต่อหา ใส่เบอร์ให้หน่อย";
    if (!formData.phonePrefix.startsWith("+")) {
      newErrors.phonePrefix = "ใส่ + ด้วยนะ";
    } else if ((formData.phonePrefix.match(/\+/g) || []).length > 1) {
      newErrors.phonePrefix = "ใส่ + ใส่ตัวเดียวพอ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      localStorage.setItem("accountData", JSON.stringify(formData));
      alert("Profile information saved!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto p-6 w-full">
        <h1 className="text-3xl font-bold mb-6 text-left">My Account</h1>

        <div className="mt-10">
          <div className="flex flex-col items-center mb-6">
            <label htmlFor="avatar-upload" className="cursor-pointer relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImage} alt="User profile" />
              </Avatar>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="mt-4 text-xl font-semibold">Hi, {formData.firstName || "User"}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <div>
                    <Label>Phone Prefix</Label>
                    <Input type="text" name="phonePrefix" value={formData.phonePrefix} onChange={handleInputChange} />
                    {errors.phonePrefix && <p className="text-red-500 text-sm">{errors.phonePrefix}</p>}
                  </div>
                  <div className="flex-grow">
                    <Label>Phone Number</Label>
                    <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                    {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-[#2D776E] hover:bg-[#24685F] text-white" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2D776E] text-white py-8 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* โลโก้ */}
            <Image
              src="/logoW.png"
              alt="PETI Logo"
              width={170}
              height={90}
            />

            {/* ข้อมูลติดต่อ */}
            <div className="text-center">
              <p className="font-semibold">Contact us</p>
              <p>yimwired@gmail.com</p>
            </div>

            {/* เกี่ยวกับ */}
            <div className="text-center">
              <p className="font-semibold">About</p>
              <p>@PET2025</p>
            </div>

            {/* ไอคอนโซเชียลมีเดียพร้อมลิงก์ */}
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[#24685F]">
                <Facebook className="w-6 h-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-[#24685F]">
                <Instagram className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-[#24685F]">
                <MessageCircle className="w-6 h-6" />
                <span className="sr-only">MessageCircle</span>
              </Link>
              <Link href="#" className="hover:text-[#24685F]">
                <Twitter className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}