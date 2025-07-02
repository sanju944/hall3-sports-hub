
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, User, Home, Key, UserPlus } from 'lucide-react';

interface AuthorizedStudent {
  rollNumber: string;
  name: string;
}

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface UserSignupProps {
  authorizedStudents: AuthorizedStudent[];
  users: User[];
  onUserRegister: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSignup: React.FC<UserSignupProps> = ({
  authorizedStudents,
  users,
  onUserRegister,
  open,
  onOpenChange
}) => {
  const [signupForm, setSignupForm] = useState({
    rollNumber: '',
    name: '',
    phoneNumber: '',
    roomNumber: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSignup = () => {
    if (!signupForm.rollNumber || !signupForm.name || !signupForm.phoneNumber || !signupForm.roomNumber || !signupForm.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(signupForm.phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    // Check if student is authorized
    const isAuthorized = authorizedStudents.some(student => 
      student.rollNumber.toLowerCase() === signupForm.rollNumber.toLowerCase() && 
      student.name.toLowerCase() === signupForm.name.toLowerCase()
    );

    if (!isAuthorized) {
      toast({
        title: "Access Denied",
        description: "Student not found in authorized list. Please contact admin.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists
    if (users.some(user => user.rollNumber.toLowerCase() === signupForm.rollNumber.toLowerCase())) {
      toast({
        title: "Error",
        description: "User with this roll number already exists.",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      rollNumber: signupForm.rollNumber,
      name: signupForm.name,
      phoneNumber: signupForm.phoneNumber,
      roomNumber: signupForm.roomNumber,
      password: signupForm.password,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    onUserRegister(newUser);
    setSignupForm({ rollNumber: '', name: '', phoneNumber: '', roomNumber: '', password: '' });
    onOpenChange(false);

    toast({
      title: "Registration Successful",
      description: "You have been registered successfully. You can now sign in.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600 text-xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Student Registration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="rollNumber"
                value={signupForm.rollNumber}
                onChange={(e) => setSignupForm({...signupForm, rollNumber: e.target.value})}
                className="border-gray-300 focus:border-green-500 pl-10"
                placeholder="Enter your roll number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={signupForm.name}
              onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
              className="border-gray-300 focus:border-green-500"
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                value={signupForm.phoneNumber}
                onChange={(e) => setSignupForm({...signupForm, phoneNumber: e.target.value})}
                className="border-gray-300 focus:border-green-500 pl-10"
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <div className="relative">
              <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="roomNumber"
                value={signupForm.roomNumber}
                onChange={(e) => setSignupForm({...signupForm, roomNumber: e.target.value})}
                className="border-gray-300 focus:border-green-500 pl-10"
                placeholder="Enter your room number"
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
                value={signupForm.password}
                onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                className="border-gray-300 focus:border-green-500 pl-10"
                placeholder="Create a password"
              />
            </div>
          </div>
          <Button 
            onClick={handleSignup} 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Register
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSignup;
