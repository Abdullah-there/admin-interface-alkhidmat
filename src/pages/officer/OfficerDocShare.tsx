import { supabase } from "@/supabase-client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const OfficerDocShare = () => {
    const { session } = useAuth();

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [SharedWith, setSharedWith] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"byYou" | "toYou">("byYou");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sharedByYou, setSharedByYou] = useState<any[]>([]);
    const [sharedToYou, setSharedToYou] = useState<any[]>([]);

    const role = session?.user?.user_metadata?.role;

    const ShareImages = async () => {
        if (!image || !subject || !message || SharedWith.length === 0) {
            toast.error("All fields required");
            return;
        }

        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
            .from("admin-images")
            .upload(fileName, image);

        if (uploadError) {
            toast.error("Image upload failed");
            return;
        }

        const { data } = supabase.storage
            .from("admin-images")
            .getPublicUrl(fileName);

        const { error } = await supabase.from("docsShare").insert({
            subject: subject,
            message: message,
            image_url: data.publicUrl,
            SharedWith: SharedWith,
            SharedBy: session?.user?.email,
        });

        if (error) {
            toast.error("Failed to save record");
            console.error(error)
            return;
        }

        toast.success("Document shared successfully");
        setSubject("");
        setMessage("");
        setImage(null);
        setSharedWith([]);
        fetchDocs();
    };

    const fetchDocs = async () => {
        if (!session) return;

        const { data: byYou } = await supabase
            .from("docsShare")
            .select("*")
            .eq("SharedBy", session.user.email)
            .order("created_at", { ascending: false });

        const { data: toYou } = await supabase
            .from("docsShare")
            .select("*")
            .contains("SharedWith", [role])
            .order("created_at", { ascending: false });

        setSharedByYou(byYou || []);
        setSharedToYou(toYou || []);
    };

    useEffect(() => {
        fetchDocs();
    }, [session]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [activeTab]);

    const toggleRole = (r: string) => {
        setSharedWith((prev) =>
            prev.includes(r) ? prev.filter((i) => i !== r) : [...prev, r]
        );
    };

    const activeDocs = activeTab === "byYou" ? sharedByYou : sharedToYou;
    const total = activeDocs.length;
    const currentDoc = activeDocs[currentIndex];


    return (
        <DashboardLayout>
            <div>
                <h1 className="text-3xl font-bold text-foreground">Share Images</h1>
                <p className="text-muted-foreground mb-5">Share Images with other Admins</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Share Document</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />

                        <Textarea
                            placeholder="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                        />

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Share With</p>
                            {["Program Manager", "Finance Administrator"].map((r) => (
                                <div key={r} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={SharedWith.includes(r)}
                                        onCheckedChange={() => toggleRole(r)}
                                    />
                                    <span className="text-sm">{r}</span>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full" onClick={ShareImages}>
                            Share
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("byYou")}
                                className={`w-1/2 text-center font-semibold py-2 transition
        ${activeTab === "byYou"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground"}`}
                            >
                                Shared By You
                            </button>

                            <button
                                onClick={() => setActiveTab("toYou")}
                                className={`w-1/2 text-center font-semibold py-2 transition
        ${activeTab === "toYou"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground"}`}
                            >
                                Shared To You
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center gap-4">

                        {total === 0 ? (
                            <p className="text-sm text-muted-foreground">No documents found</p>
                        ) : (
                            <>
                                {/* Image */}
                                <img
                                    src={currentDoc.image_url}
                                    className="w-full max-h-80 object-contain rounded border"
                                />

                                {/* Subject */}
                                <p className="font-medium text-sm">{currentDoc.subject}</p>

                                {/* Controls */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            setCurrentIndex((prev) => Math.max(prev - 1, 0))
                                        }
                                        disabled={currentIndex === 0}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        ←
                                    </button>

                                    <span className="text-sm text-muted-foreground">
                                        {currentIndex + 1} / {total}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setCurrentIndex((prev) =>
                                                Math.min(prev + 1, total - 1)
                                            )
                                        }
                                        disabled={currentIndex === total - 1}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        →
                                    </button>
                                </div>
                            </>
                        )}
                    </CardContent>

                </Card>

            </div>
        </DashboardLayout>
    );
};

export default OfficerDocShare;
