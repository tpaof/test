// pages/admin/tours/delete/[id].jsx
"use client";

import { useState, useContext } from "react";
import { AdminHeader } from "@/components/ui/admin/header";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Auth.context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteTourPage({ tourData, error: initialError, tourId }) {
  const { state } = useContext(AuthContext);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/packages/${tourId}`, {
        method: "DELETE",
        headers: {
          Authorization: state.user?.token ? `Bearer ${state.user.token}` : "",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`ไม่สามารถลบทัวร์ได้: ${data.error?.message || "Unknown error"}`);
      }

      toast({
        title: "Success!",
        description: "Tour has been deleted successfully.",
        variant: "success",
      });
      router.push("/admin/tours");
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to delete tour: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex-1">
        <AdminHeader title="Delete Tour" />
        <div className="p-8">
          <p className="text-xl text-red-500">เกิดข้อผิดพลาด: {error}</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="flex-1">
        <AdminHeader title="Delete Tour" />
        <div className="p-8">
          <p className="text-xl text-gray-500">ไม่พบข้อมูลทัวร์</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <AdminHeader title="Delete Tour" />
      <div className="p-8">
        <button
          onClick={() => router.push("/admin/tours")}
          className="flex items-center text-gray-600 hover:text-[#2A8470] mb-6"
          disabled={submitting}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Tour List
        </button>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ยืนยันการลบทัวร์
            </h2>
            <p className="text-gray-600 mb-4">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{tourData.title}"? 
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/tours")}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-2" />
                    ลบทัวร์
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  let tourData = null;
  let error = null;

  try {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/packages/${params.id}?populate=images`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `ไม่สามารถดึงข้อมูลทัวร์ได้: ${response.status} - ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const tour = data.data;

    if (!tour) {
      throw new Error(`ไม่พบทัวร์ที่มี ID: ${params.id}`);
    }

    tourData = {
      title: tour.attributes.title || "",
      price: tour.attributes.price || "",
      description: tour.attributes.description?.[0]?.children?.[0]?.text || "",
      duration: tour.attributes.duration || "",
      capacity_max: tour.attributes.capacity_max || "",
      capacity: tour.attributes.capacity || "",
      isAvailable: tour.attributes.isAvailable || "Not Available",
      images: tour.attributes.images?.data?.map((img) => ({
        id: img.id,
        url: `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${img.attributes.url}`,
      })) || [],
    };
  } catch (err) {
    error = err.message;
  }

  return {
    props: {
      tourData,
      error,
      tourId: params.id,
    },
  };
}