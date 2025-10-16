import React, { useState } from 'react';
import { Page } from '../../App';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Search, 
  Send,
  Phone,
  Video
} from "lucide-react";

interface MessagesModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
}

const MessagesModule: React.FC<MessagesModuleProps> = ({ onNavigate }) => {
  
  const mockConversations = [
    {
      id: 1,
      name: "Mayor Johnson",
      avatar: "MJ",
      avatarColor: "bg-green-500",
      lastMessage: "Thank you for your petition regarding downtown transportation.",
      lastMessageTime: "10:28 AM",
      online: true,
      messages: [
        { sender: "other", text: "Hello! I received your petition regarding the downtown transportation improvements.", time: "10:28 AM" },
        { sender: "me", text: "Thank you for acknowledging it, Mayor. The bus frequency during peak hours is really affecting many commuters.", time: "10:35 AM" },
        { sender: "other", text: "I completely understand the concern. We've actually been working on a comprehensive transportation plan.", time: "10:40 AM" },
      ]
    },
    {
      id: 2,
      name: "Downtown Residents Association",
      avatar: "DR",
      avatarColor: "bg-blue-500",
      lastMessage: "Sarah: The streetlight repair has been scheduled.",
      lastMessageTime: "Yesterday",
      members: 47,
      online: false,
      messages: [
        { sender: "other", text: "Sarah: The streetlight repair has been scheduled.", time: "Yesterday" }
      ]
    },
    {
      id: 3,
      name: "City Planning Department",
      avatar: "CP",
      avatarColor: "bg-purple-500",
      lastMessage: "We've received your feedback on the new park proposal.",
      lastMessageTime: "2 days ago",
      online: true,
      messages: [
         { sender: "other", text: "We've received your feedback on the new park proposal.", time: "2 days ago" }
      ]
    }
  ];

  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, { sender: 'me', text: newMessage, time: 'Now' }]
    };
    setSelectedConversation(updatedConversation);
    setNewMessage("");
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg h-[calc(100vh-12rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel: Conversation List */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-civix-warm-beige dark:border-gray-700">
              <h2 className="text-xl font-bold text-civix-dark-brown dark:text-white">Messages</h2>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10 bg-civix-light-gray dark:bg-gray-700" />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {mockConversations.map(convo => (
                <div 
                  key={convo.id} 
                  className={`flex items-center p-4 cursor-pointer border-l-4 ${selectedConversation.id === convo.id ? 'border-civix-civic-green bg-civix-warm-beige dark:bg-gray-700' : 'border-transparent hover:bg-civix-warm-beige/50 dark:hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedConversation(convo)}
                >
                  <Avatar className="h-12 w-12 mr-4 relative">
                    <AvatarFallback className={`${convo.avatarColor} text-white`}>{convo.avatar}</AvatarFallback>
                    {convo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-civix-dark-brown dark:text-white truncate">{convo.name}</h3>
                      <p className="text-xs text-gray-400 shrink-0">{convo.lastMessageTime}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Chat Window */}
        <ResizablePanel defaultSize={70} minSize={50}>
           <div className="flex flex-col h-full bg-civix-light-gray/50 dark:bg-gray-900/50">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-civix-warm-beige dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 relative">
                      <AvatarFallback className={`${selectedConversation.avatarColor} text-white`}>{selectedConversation.avatar}</AvatarFallback>
                      {selectedConversation.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                  </Avatar>
                  <div>
                      <h3 className="font-semibold text-civix-dark-brown dark:text-white">{selectedConversation.name}</h3>
                      <p className="text-xs text-gray-400">{selectedConversation.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon"><Phone className="w-5 h-5 text-gray-500"/></Button>
                  <Button variant="ghost" size="icon"><Video className="w-5 h-5 text-gray-500"/></Button>
                </div>
              </div>

              {/* Message Area */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {selectedConversation.messages.map((msg, index) => (
                  <div key={index} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                    {msg.sender === 'other' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${selectedConversation.avatarColor} text-white text-xs`}>{selectedConversation.avatar}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-civix-civic-green text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-civix-dark-brown dark:text-gray-200 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-civix-warm-beige dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <Input 
                    placeholder="Type your message..." 
                    className="flex-grow bg-civix-light-gray dark:bg-gray-700 border-0"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
                    <Send className="w-5 h-5"/>
                  </Button>
                </form>
              </div>
           </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  );
};

export default MessagesModule;

