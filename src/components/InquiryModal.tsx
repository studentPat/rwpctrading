import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";
import { ReactNode } from "react";

interface InquiryModalProps {
  productName: string;
  trigger?: ReactNode;
}

export default function InquiryModal({ productName, trigger }: InquiryModalProps) {
  const message = encodeURIComponent(`Hello, I'd like to inquire about ${productName}.`);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>Inquire Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Inquire About</DialogTitle>
        </DialogHeader>
        <p className="text-primary font-semibold">{productName}</p>
        <p className="text-sm text-muted-foreground mb-2">
          Reach out to us through any of these channels:
        </p>
        <div className="space-y-2">
          <a
            href={`https://m.me/rwpctrading?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Messenger</p>
                <p className="text-xs text-muted-foreground">Chat with us on Facebook Messenger</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
          <a
            href="https://facebook.com/rwpctrading"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Facebook className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Facebook Page</p>
                <p className="text-xs text-muted-foreground">Visit our Facebook page</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
          <a
            href="tel:+639000000000"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Phone</p>
              <p className="text-xs text-muted-foreground">+63 XXX XXX XXXX</p>
            </div>
          </a>
          <a
            href={`mailto:rwpctrading@email.com?subject=Inquiry about ${productName}&body=${decodeURIComponent(message)}`}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-xs text-muted-foreground">rwpctrading@email.com</p>
            </div>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
