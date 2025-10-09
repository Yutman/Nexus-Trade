'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import NavItems from "./NavItems"

const UserDropdown = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        router.push('/sign-in');
    }

    const user = {name: 'John', email: 'nimimishiri@gmail.com'};

    // Safe function to extract first name
    const getFirstName = (name: string | null | undefined): string => {
        if (typeof name !== 'string') return 'User';
        const trimmed = name.trim();
        if (!trimmed) return 'User';
        const parts = trimmed.split(/\s+/);
        return parts[0] || 'User';
    };

    // Safe function to get first character for avatar
    const getFirstChar = (name: string | null | undefined): string => {
        if (typeof name !== 'string') return 'U';
        const trimmed = name.trim();
        if (!trimmed) return 'U';
        return trimmed[0].toUpperCase();
    };

  return (
    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant='ghost' className='flex items-center gap-3 text-gray-4 hover:text-yellow-500'>
        <Avatar className="h-8 w-8">
             <AvatarImage src="data:image/jpeg;base64,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"/>
                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold" >
                     {getFirstChar(user.name)}
                </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
            <span className="text-base font-medium text-gray-400">
                {getFirstName(user.name)}
            </span>
        </div>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="text-gray-400">
    <DropdownMenuLabel>
         <div className="flex relative items-center gap-3 py-2">
         <Avatar className="h-10 w-10">
             <AvatarImage src="data:image/jpeg;base64,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"/>
                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold" >
                     {getFirstChar(user.name)}
                </AvatarFallback>
        </Avatar>
         <div className="flex flex-col">
            <span className="text-base font-medium text-gray-400">
                {user.name}
            </span>
            <span className="text-sm text-gray-500">
                {user.email}
            </span>
        </div>
    </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-gray-600"/>
    <DropdownMenuItem onClick={handleSignOut} className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
        <LogOut className='h-4 w-4 mr-2 hidden sm:block'/>
        Logout
    </DropdownMenuItem>
    <DropdownMenuSeparator className="hidden sm:block bg-gray-600"/>
    <nav className='sm:hidden'>
      <NavItems/>
    </nav>
  </DropdownMenuContent>
</DropdownMenu>
  )
}

export default UserDropdown
