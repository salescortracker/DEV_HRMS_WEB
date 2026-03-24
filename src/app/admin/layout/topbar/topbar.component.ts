import { Component, EventEmitter, Output,ViewChild,ElementRef } from '@angular/core';
interface ChatMessage {
   sender: 'User' | 'Bot';
  text?: string; 
   attachmentName?: string;
}
@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
@Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
   @ViewChild('fileInput') fileInput!: ElementRef;

  isOpen = false;
  showIntro = true;
  showModules = false;
  showEmojiPicker = false;
  userName=sessionStorage.getItem("Name");
  userMessage = '';

  emojis: string[] = [
    '😀','😃','😄','😁','😆','😅','😂','🤣',
    '😊','😉','😍','😘','😎','🤩','🤔','😐',
    '😢','😭','😡','👍','🙏','👏','🔥','❤️'
  ];

  modules = [
    'Leave','Attendance','Employee Profile','Help Desk',
    'Expenses','Timesheet','Recruitment','Company News',
    'Company Policies','Events','Assets','Compensation',
    'Performance','My Team','My Calendar'
  ];

  messages: ChatMessage[] = [
    {
      sender: 'Bot',
      text: '🤖 Hi! I am HRMS, an AI assistant.\nAsk me anything about Cortracker HRMS 😊\n🌐 cortracker.com'
    }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.showEmojiPicker = false;
  }

  openModules() {
    this.showIntro = false;
    this.showModules = true; // stays visible
  }

  sendMessage() {
    const msg = this.userMessage.trim();
    if (!msg) return;

    this.messages.push({ sender: 'User', text: msg });

    if (['hi','hai','hello','hey'].includes(msg.toLowerCase())) {
      this.messages.push({
        sender: 'Bot',
        text: '😊 Hi! What can I help you with today?'
      });
    } else {
      this.messages.push({
        sender: 'Bot',
        text: '🤖 Please click **View Modules** to explore HRMS features.'
      });
    }

    this.userMessage = '';
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.userMessage += emoji;
    this.showEmojiPicker = false;
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.messages.push({
        sender: 'User',
        attachmentName: file.name
      });
    }
  }
  
}
