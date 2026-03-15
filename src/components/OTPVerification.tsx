import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Mail, ArrowLeft, Loader2 } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  title?: string;
  description?: string;
}

export const OTPVerification = ({
  email,
  onVerify,
  onResend,
  onBack,
  loading,
  title = 'Verify Your Email',
  description = 'Enter the 6-digit code sent to your email',
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      onVerify(pasted);
    }
  };

  const handleResend = async () => {
    await onResend();
    setResendCooldown(60);
  };

  return (
    <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          <br />
          <span className="mt-1 inline-flex items-center gap-1 font-medium text-foreground">
            <Mail className="h-3 w-3" />
            {email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-12 text-center text-lg font-bold"
              disabled={loading}
            />
          ))}
        </div>

        <Button
          onClick={() => onVerify(otp.join(''))}
          className="w-full"
          disabled={loading || otp.some((d) => !d)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verify Code
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
