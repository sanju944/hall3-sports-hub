
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, Key } from 'lucide-react';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface UserSigninProps {
  users: User[];
  onUserLogin: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSignin: React.FC<UserSigninProps> = ({
  users,
  onUserLogin,
  open,
  onOpenChange
}) => {
  const [signinForm, setSigninForm] = useState({
    rollNumber: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSignin = () => {
    if (!signinForm.rollNumber || !signinForm.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user = users.find(u => 
      u.rollNumber.toLowerCase() === signinForm.rollNumber.toLowerCase() && 
      u.password === signinForm.password
    );

    if (!user) {
      toast({
        title: "Login Failed",
        description: "Invalid roll number or password.",
        variant: "destructive",
      });
      return;
    }

    onUserLogin(user);
    setSigninForm({ rollNumber: '', password: '' });
    onOpenChange(false);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-blue-600 text-xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Student Sign In
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="rollNumber"
                value={signinForm.rollNumber}
                onChange={(e) => setSigninForm({...signinForm, rollNumber: e.target.value})}
                className="border-gray-300 focus:border-blue-500 pl-10"
                placeholder="Enter your roll number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={signinForm.password}
                onChange={(e) => setSigninForm({...signinForm, password: e.target.value})}
                className="border-gray-300 focus:border-blue-500 pl-10"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleSignin()}
              />
            </div>
          </div>
          <Button 
            onClick={handleSignin} 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSignin;
