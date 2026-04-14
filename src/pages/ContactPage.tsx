import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone, Mail, MapPin, ExternalLink, Send, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";

const FB_PAGE = "https://www.facebook.com/profile.php?id=61575260983217";
const MESSENGER = "https://m.me/61575260983217";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Name and message are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({ name, email: email || null, message });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to send feedback");
    } else {
      toast.success("Feedback sent! Thank you.");
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMC0yIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="opacity-80">Have a question? We'd love to hear from you.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="font-display text-xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <a href="tel:09687262353" className="text-sm text-primary hover:underline">09687262353</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <a href="mailto:rwpctrading@gmail.com" className="text-sm text-primary hover:underline">rwpctrading@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-sm text-muted-foreground">Unit 2B 2nd Floor One Santiago Place Building, Gov. I. Santiago St., Brgy. Malinta, Valenzuela City</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Facebook</p>
                  <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">RW PC Trading</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Messenger</p>
                  <a href={MESSENGER} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Message us on Facebook</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Operating Hours</p>
                  <p className="text-sm text-muted-foreground">Monday – Saturday, 9:00 AM – 7:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Installment Available</p>
                  <p className="text-sm text-muted-foreground">Via Salmon Financing, Credit Card (Mastercard, Visa, JCB) or E-Wallet (GCash, Maya, ShopeePay, GrabPay, AliPay, etc.)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Send Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Your feedback or message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Sending..." : "Send Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
