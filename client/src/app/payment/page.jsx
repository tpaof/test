'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Payment() {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '', // แก้ไขจาก emaill เป็น email
        phone: '',
        price: '',
        slip: null,
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    useEffect(() => {
        if (bookingId) {
            fetchBookingData(bookingId);
        }
    }, [bookingId]);

    const fetchBookingData = async (id) => {
        try {
            const token = sessionStorage.getItem("auth.jwt");
            if (!token) {
                throw new Error("No JWT token found");
            }

            const response = await fetch(`http://localhost:1337/api/history-packages/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch booking data: ${errorText}`);
            }

            const result = await response.json();
            const booking = result.data;

            setFormData(prev => ({
                ...prev,
                price: booking.price || '',
            }));
        } catch (error) {
            console.error('Error fetching booking:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'slip') {
            setFormData({ ...formData, slip: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem("auth.jwt");
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'กรุณาเข้าสู่ระบบ',
                    text: 'คุณต้องเข้าสู่ระบบก่อนทำการชำระเงิน',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/login');
                });
                return;
            }

            if (!bookingId) {
                throw new Error("Booking ID is missing");
            }

            // อัปโหลดสลิป (ถ้ามี)
            let slipId = null;
            if (formData.slip) {
                const slipData = new FormData();
                slipData.append('files', formData.slip);

                const uploadResponse = await fetch('http://localhost:1337/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: slipData
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    throw new Error(`Failed to upload slip: ${errorText}`);
                }

                const uploadResult = await uploadResponse.json();
                slipId = uploadResult[0].id; // รับ ID ของไฟล์ที่อัปโหลด
            }

            // อัปเดทข้อมูลการจอง
            const paymentData = {
                data: {
                    name: formData.name,
                    lastname: formData.lastname,
                    email: formData.email, // แก้ไขจาก emaill เป็น email
                    phone: formData.phone,
                    price: parseInt(formData.price, 10),
                    slip: slipId ? { id: slipId } : null, // เชื่อมโยงสลิป (ถ้ามี)
                    publishedAt: null // ลบ publishedAt เพื่อเปลี่ยนสถานะ
                }
            };

            const updateResponse = await fetch(`http://localhost:1337/api/history-packages/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Failed to update booking: ${errorText}`);
            }

            Swal.fire({
                icon: 'success',
                title: 'ชำระเงินสำเร็จ!',
                text: 'การชำระเงินของคุณสำเร็จเรียบร้อยแล้ว',
                confirmButtonText: 'OK'
            }).then(() => {
                router.push('/history');
            });

        } catch (error) {
            console.error('Error submitting payment:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถบันทึกข้อมูลการชำระเงินได้ กรุณาลองใหม่',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div className="container mx-auto px-8 py-8 flex flex-col items-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6 border w-full max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-white bg-[#24685F] p-4 rounded-t-lg text-center">PAYMENT</h1>
                
                <div className="flex flex-col md:flex-row items-center justify-between p-6">
                    <form onSubmit={handleSubmit} className="bg-gray-100 shadow-md rounded-lg p-6 w-full md:w-1/2">
                        <div className="flex gap-4 mb-4">
                            <div className="w-1/2">
                                <label className="block text-gray-700 mb-1">ชื่อ</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#24685F]"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 mb-1">นามสกุล</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#24685F]"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">อีเมล</label>
                            <input
                                type="email"
                                name="email" // แก้ไขจาก emaill เป็น email
                                value={formData.email}
                                onChange={handleChange}
                                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#24685F]"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">เบอร์โทร</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#24685F]"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">จำนวนเงิน</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#24685F]"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">อัปโหลดสลิป</label>
                            <input
                                type="file"
                                name="slip"
                                accept="image/*"
                                onChange={handleChange}
                                className="border rounded w-full px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-none file:bg-[#24685F] file:text-white cursor-pointer"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="bg-[#24685F] hover:bg-[#1E5A50] text-white w-full py-2 text-lg rounded-lg"
                        >
                            ยืนยันการชำระเงิน
                        </Button>
                    </form>
                    
                    <div className="flex flex-col items-center w-full md:w-1/2 mt-6 md:mt-0">
                        <h2 className="text-2xl font-semibold text-[#24685F]">QR CODE & PROMPT PAY</h2>
                        <Image
                            src="/qr.png"
                            alt="QR Code"
                            width={300}
                            height={300}
                            className="border p-2 rounded-lg mt-4"
                        />
                        <p className="text-lg font-semibold text-gray-700 mt-2">0935941899</p>
                        <p className="text-md text-gray-600">นายณัฐพล ยิ้มน้อย</p>
                    </div>
                </div>
            </div>
        </div>
    );
}