import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Phone, Video, Send, Plus, Trash2, Check, CheckCheck,
  Copy, Settings, Info, Cloud, ShieldAlert, Sparkles, Image,
  FileText, Download, Play, Mic, MoreVertical, X, Star, Forward,
  Reply, Smile, Paperclip, Camera, HelpCircle, User, Briefcase,
  Mail, Calendar, ArrowRight, Folder, Award, Zap, Bell, Menu,
  ChevronRight, ArrowLeft, Loader2, MessageSquare, Users
} from 'lucide-react';

// Custom toggle switch component
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// Custom Slack Icon
function SlackIcon({ size = 20, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="3" height="8" x="2" y="8" rx="1.5" />
      <path d="M12 2v8" />
      <path d="M12 14v8" />
      <path d="M10 12H2" />
      <path d="M22 12h-8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ── INITIAL DATASETS ───────────────────────────────────────────
const INITIAL_EMPLOYEES = [
  {
    id: 'emp_deva',
    name: 'Deva',
    designation: 'CTO & Super Admin',
    department: 'Engineering',
    email: 'deva@storyseed.com',
    phone: '+91 99999 88888',
    joiningDate: '2024-05-01',
    project: 'Super Admin Portal',
    manager: 'None',
    status: 'online',
    unread: 0,
    avatarColor: 'bg-violet-600',
    favorite: true,
    thoughtOfTheDay: 'Engineering robust enterprise systems with antigravity speed and precision.'
  },
  {
    id: 'emp_1',
    name: 'Anjali Patel',
    designation: 'HR Manager',
    department: 'HR',
    email: 'anjali@storyseed.com',
    phone: '+91 98765 43210',
    joiningDate: '2024-01-15',
    project: 'Onboarding Automation',
    manager: 'Rajesh Kumar',
    status: 'online',
    unread: 2,
    avatarColor: 'bg-emerald-500',
    favorite: true,
    thoughtOfTheDay: 'Empathy and clear transparency build the strongest, most resilient teams.'
  },
  {
    id: 'emp_2',
    name: 'Vikram Singh',
    designation: 'Engineering Lead',
    department: 'Engineering',
    email: 'vikram@storyseed.com',
    phone: '+91 98765 43211',
    joiningDate: '2024-01-20',
    project: 'Super Admin Portal',
    manager: 'Rajesh Kumar',
    status: 'online',
    unread: 0,
    avatarColor: 'bg-blue-500',
    favorite: true,
    thoughtOfTheDay: 'Keep it simple, robust, and readable. Code is poetry.'
  },
  {
    id: 'emp_3',
    name: 'Rohan Sharma',
    designation: 'Software Engineer',
    department: 'Engineering',
    email: 'rohan@storyseed.com',
    phone: '+91 98765 43212',
    joiningDate: '2024-02-01',
    project: 'Client Portal Sync',
    manager: 'Vikram Singh',
    status: 'offline',
    unread: 0,
    avatarColor: 'bg-amber-500',
    favorite: false,
    thoughtOfTheDay: 'Write comprehensive integration tests, automate everything, and document your code.'
  },
  {
    id: 'emp_4',
    name: 'Priya Das',
    designation: 'UI/UX Designer',
    department: 'Design',
    email: 'priya@storyseed.com',
    phone: '+91 98765 43213',
    joiningDate: '2024-02-10',
    project: 'Brand Design System',
    manager: 'Vikram Singh',
    status: 'online',
    unread: 1,
    avatarColor: 'bg-indigo-500',
    favorite: true,
    thoughtOfTheDay: 'Design is a solution to a problem. Art is a question to a problem.'
  },
  {
    id: 'emp_5',
    name: 'Rohit Mehta',
    designation: 'Sales Executive',
    department: 'Marketing',
    email: 'rohit@storyseed.com',
    phone: '+91 98765 43214',
    joiningDate: '2024-03-01',
    project: 'Enterprise Growth',
    manager: 'Rajesh Kumar',
    status: 'online',
    unread: 0,
    avatarColor: 'bg-rose-500',
    favorite: false,
    thoughtOfTheDay: 'Build long-term relationships first, sell value solutions second.'
  },
  {
    id: 'team_eng',
    name: 'Platform Engineering Team',
    designation: 'Group Chat · 5 members',
    department: 'Engineering',
    email: 'team-eng@storyseed.com',
    phone: '',
    joiningDate: '2024-01-15',
    project: 'Super Admin Portal',
    manager: 'Rajesh Kumar',
    status: 'online',
    unread: 1,
    avatarColor: 'bg-indigo-600',
    favorite: true,
    isGroup: true,
    members: ['Deva', 'Anjali Patel', 'Vikram Singh', 'Rohan Sharma', 'Priya Das'],
    thoughtOfTheDay: 'Collaborating together to engineer next-generation high-performance software systems.'
  }
];

const INITIAL_MESSAGES = {
  emp_deva: [
    { id: 'md1', sender: 'emp_deva', text: 'Welcome to the employee hub communications module.', time: '09:00 AM', date: 'Today', read: true },
    { id: 'md2', sender: 'me', text: 'Thank you Deva! The interface is fully setup and secure.', time: '09:05 AM', date: 'Today', read: true }
  ],
  emp_1: [
    { id: 'm1', sender: 'emp_1', text: 'Hi! Did you get a chance to review the onboarding criteria?', time: '10:30 AM', date: 'Today', read: true },
    { id: 'm2', sender: 'me', text: 'Yes Anjali, they look perfect. Let me update the portal with these.', time: '10:35 AM', date: 'Today', read: true },
    { id: 'm3', sender: 'emp_1', text: 'Awesome, thank you! I just uploaded the template in shared documents.', time: '10:36 AM', date: 'Today', read: true }
  ],
  emp_2: [
    { id: 'm4', sender: 'emp_2', text: 'Hey, are we still merging the permissions module today?', time: '09:15 AM', date: 'Today', read: true },
    { id: 'm5', sender: 'me', text: 'Yes, just running final integration checks. Everything looks solid.', time: '09:18 AM', date: 'Today', read: true }
  ],
  emp_3: [
    { id: 'm6', sender: 'me', text: 'Rohan, can you verify the attendance schema migration?', time: 'Yesterday', date: 'Yesterday', read: true },
    { id: 'm7', sender: 'emp_3', text: 'Sure, I verified it locally and it succeeded. I will push the PR.', time: 'Yesterday', date: 'Yesterday', read: true }
  ],
  emp_4: [
    { id: 'm8', sender: 'emp_4', text: 'Hello! I updated the design specs for the communication hub.', time: '11:02 AM', date: 'Today', read: true }
  ],
  emp_5: [],
  team_eng: [
    { id: 'm_g1', sender: 'emp_2', text: 'Hey team, let’s use this channel to sync our project tasks.', time: '09:00 AM', date: 'Today', read: true },
    { id: 'm_g2', sender: 'emp_3', text: 'Great. Pinned the task board so we can track items here.', time: '09:05 AM', date: 'Today', read: true },
    { id: 'm_g3', sender: 'emp_4', text: 'Awesome, I’ve completed the UI mockup for it!', time: '09:10 AM', date: 'Today', read: true }
  ]
};

const INITIAL_TASKS = {
  emp_deva: [
    { id: 'td1', title: 'Enterprise Architecture Audit', desc: 'Verify container orchestration security policy configurations.', dueDate: '2026-07-30', priority: 'High', status: 'In Progress', progress: 50, assignedBy: 'Deva' }
  ],
  emp_1: [
    { id: 't1', title: 'Onboarding Kit Review', desc: 'Revise employee handbook template for 2026 guidelines.', dueDate: '2026-07-15', priority: 'High', status: 'In Progress', progress: 65, assignedBy: 'Super Admin' },
    { id: 't2', title: 'Conduct HR Session', desc: 'Host training session for new administrators.', dueDate: '2026-07-20', priority: 'Medium', status: 'Upcoming', progress: 0, assignedBy: 'Super Admin' }
  ],
  emp_2: [
    { id: 't3', title: 'Database Security Audit', desc: 'Audit role access control schemas on Supabase RLS.', dueDate: '2026-07-12', priority: 'High', status: 'In Progress', progress: 85, assignedBy: 'Super Admin' },
    { id: 't4', title: 'Deploy Next.js build', desc: 'Configure automatic deploy pipelines on Vercel.', dueDate: '2026-07-09', priority: 'High', status: 'Completed', progress: 100, assignedBy: 'Super Admin' }
  ],
  emp_3: [
    { id: 't5', title: 'Attendance API endpoints', desc: 'Optimize check-in/check-out queries for large datasets.', dueDate: '2026-07-18', priority: 'Medium', status: 'In Progress', progress: 40, assignedBy: 'Vikram Singh' }
  ],
  emp_4: [
    { id: 't6', title: 'Communication Hub UI Spec', desc: 'Deliver Figma mockups for light/dark mode panels.', dueDate: '2026-07-10', priority: 'High', status: 'Completed', progress: 100, assignedBy: 'Vikram Singh' }
  ],
  emp_5: [],
  team_eng: [
    { id: 't_g1', title: 'Task Report Dashboard', desc: 'Design task reporting dashboard module.', dueDate: '2026-07-20', priority: 'High', status: 'In Progress', progress: 75, assignedBy: 'Super Admin' },
    { id: 't_g2', title: 'Socket Server Setup', desc: 'Configure WebSockets for group chat updates.', dueDate: '2026-07-18', priority: 'High', status: 'Completed', progress: 100, assignedBy: 'Vikram Singh' },
    { id: 't_g3', title: 'Write API Tests', desc: 'Write comprehensive integration tests for APIs.', dueDate: '2026-07-22', priority: 'Medium', status: 'Upcoming', progress: 0, assignedBy: 'Super Admin' }
  ]
};

const INITIAL_FILES = {
  emp_deva: [
    { id: 'fd1', name: 'cloud_architecture_spec.pdf', type: 'pdf', date: '2026-07-12', size: '3.4 MB', by: 'Deva' }
  ],
  emp_1: [
    { id: 'f1', name: 'onboarding_guidelines.pdf', type: 'pdf', date: '2026-07-09', size: '1.8 MB', by: 'Anjali Patel' },
    { id: 'f2', name: 'payroll_template_2026.xlsx', type: 'excel', date: '2026-07-05', size: '4.2 MB', by: 'Anjali Patel' }
  ],
  emp_2: [
    { id: 'f3', name: 'rls_policy_draft.sql', type: 'code', date: '2026-07-10', size: '12 KB', by: 'Vikram Singh' },
    { id: 'f4', name: 'architecture_diagram.png', type: 'image', date: '2026-07-08', size: '2.5 MB', by: 'Vikram Singh' }
  ],
  emp_3: [],
  emp_4: [
    { id: 'f5', name: 'ui_mockups_hub.zip', type: 'zip', date: '2026-07-10', size: '32.1 MB', by: 'Priya Das' }
  ],
  emp_5: [],
  team_eng: [
    { id: 'f_g1', name: 'api_specs.pdf', type: 'pdf', date: '2026-07-10', size: '1.4 MB', by: 'Vikram Singh' }
  ]
};

const INITIAL_TIMELINE = {
  emp_deva: [
    { id: 'tld1', action: 'Initialized deployment', target: 'Unai Super Admin Portal', time: '5 mins ago', type: 'system' }
  ],
  emp_1: [
    { id: 'tl1', action: 'Uploaded task', target: 'onboarding_guidelines.pdf', time: '10 mins ago', type: 'document' },
    { id: 'tl2', action: 'Joined meeting', target: 'Weekly HR Sync', time: '2 hours ago', type: 'meeting' },
    { id: 'tl3', action: 'Completed task', target: 'Review handbook drafts', time: 'Yesterday', type: 'task' }
  ],
  emp_2: [
    { id: 'tl4', action: 'Edited task', target: 'Database Security Audit', time: '1 hour ago', type: 'task' },
    { id: 'tl5', action: 'Video meeting', target: 'Sprint Review', time: '3 hours ago', type: 'meeting' },
    { id: 'tl6', action: 'Voice call', target: ' Rajesh Kumar', time: 'Yesterday', type: 'call' }
  ],
  emp_3: [
    { id: 'tl7', action: 'Missed call', target: 'Vikram Singh', time: 'Yesterday', type: 'call' }
  ],
  emp_4: [
    { id: 'tl8', action: 'Sent document', target: 'ui_mockups_hub.zip', time: '11:05 AM', type: 'document' }
  ],
  emp_5: [],
  team_eng: [
    { id: 'tl_g1', action: 'Created Group', target: 'Platform Engineering Team', time: '2 days ago', type: 'system' }
  ]
};

// Auto bot responses to simulate active conversations
const BOT_RESPONSES = {
  emp_deva: [
    "I have verified the build container configurations.",
    "Everything is stable and operational on the server.",
    "Please let me know if you need to deploy any new releases."
  ],
  emp_1: [
    "I'll make sure to alert the team during the next meeting.",
    "Got it! Let me know if you want me to update the task board.",
    "Thanks for confirming. I'll get back to you with the draft tomorrow."
  ],
  emp_2: [
    "Perfect, I'm checking the logs right now.",
    "I'll merge it immediately after the pipeline finishes.",
    "Sure! Let's jump on a quick huddle if you face any merge conflicts."
  ],
  emp_3: [
    "Thanks! I'm back at my desk, looking into it now.",
    "Will submit the PR soon."
  ],
  emp_4: [
    "Great! Let me know if you need the dark mode assets exported.",
    "I'll upload the design files to the sidebar here."
  ],
  emp_5: [
    "Hi, I'm currently on a client call. I will chat with you shortly!",
    "Yes, I will update the revenue pipeline reports."
  ],
  team_eng: [
    "I'll verify the socket connection logs.",
    "Let's sync up on the task board report.",
    "Vikram: I've updated the task statuses.",
    "Priya: Handing over the design files today!"
  ]
};

export default function Hub() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState('');

  const validCredentials = {
    'DEVA': { id: 'emp_deva', password: 'password123' },
    'EMP-1092': { id: 'emp_1', password: 'password123' },
    'EMP-1048': { id: 'emp_2', password: 'password123' },
    'EMP-1077': { id: 'emp_3', password: 'password123' },
    'EMP-1085': { id: 'emp_4', password: 'password123' },
    'EMP-1102': { id: 'emp_5', password: 'password123' },
    'ADMIN': { id: 'emp_deva', password: 'admin' }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const uppercaseId = loginId.trim().toUpperCase();
    const cred = validCredentials[uppercaseId];
    if (cred && cred.password === loginPassword) {
      setConnecting(true);
      setConnectStep('Validating credential signature...');
      setTimeout(() => {
        setConnectStep('Decrypting secure workspace...');
        setTimeout(() => {
          setConnectStep('Synchronizing active channels...');
          setTimeout(() => {
            setSelectedEmployeeId(null);
            setIsAuthenticated(true);
            setConnecting(false);
          }, 500);
        }, 500);
      }, 500);
    } else {
      setLoginError('Authentication failed: Invalid Employee ID or passcode signature.');
    }
  };



  const renderAvatar = (emp, sizeClass = "w-10 h-10 text-sm") => {
    if (!emp) return null;
    if (emp.isGroup) {
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0`}>
          <Users size={sizeClass.includes('w-28') ? 36 : sizeClass.includes('w-24') ? 32 : sizeClass.includes('w-11') ? 18 : 15} />
        </div>
      );
    }
    
    if (emp.avatarUrl) {
      return (
        <img 
          src={emp.avatarUrl} 
          alt={emp.name} 
          className={`${sizeClass} rounded-full object-cover shrink-0 border border-gray-200/20 shadow-inner`}
        />
      );
    }
    
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${emp.avatarColor}`}>
        {emp.name.split(' ').map(n=>n[0]).join('')}
      </div>
    );
  };

  // Navigation & Responsiveness
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [profileEmployeeId, setProfileEmployeeId] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, tasks
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState('list'); // list, chat, details
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [groupViewMode, setGroupViewMode] = useState('chat'); // chat, tasks
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Core States
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);

  const getLoggedInUser = () => {
    const uppercaseId = loginId.trim().toUpperCase();
    const cred = validCredentials[uppercaseId];
    if (cred) {
      return employees.find(e => e.id === cred.id) || employees[0];
    }
    return employees[0];
  };
  const currentUser = getLoggedInUser();

  // Composer States
  const [inputText, setInputText] = useState('');
  const [typingEmployeeId, setTypingEmployeeId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [starredMessages, setStarredMessages] = useState({});

  // Feature Modals
  const [activeCall, setActiveCall] = useState(null); // { type: 'voice'|'video', employee, status: 'ringing'|'connected', duration: 0 }
  const [callTimer, setCallTimer] = useState(0);
  const [assigningTask, setAssigningTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  const [uploadingFile, setUploadingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');

  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [starredMessagesOpen, setStarredMessagesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatWallpaper, setChatWallpaper] = useState('default');
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [notificationsAlerts, setNotificationsAlerts] = useState(true);
  const [privacyLastSeen, setPrivacyLastSeen] = useState('My Contacts');
  const [privacyReadReceipts, setPrivacyReadReceipts] = useState(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');

  const [customWallpaperColor, setCustomWallpaperColor] = useState('#e0f2fe');
  const [customWallpaperImg, setCustomWallpaperImg] = useState('');
  const [notificationSound, setNotificationSound] = useState('Ding (Default)');
  const [notificationVolume, setNotificationVolume] = useState(80);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);
  const [reactionAlerts, setReactionAlerts] = useState(true);
  
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [creationType, setCreationType] = useState('dm'); // dm or group
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpThought, setNewEmpThought] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);

  const getWallpaperClass = () => {
    switch (chatWallpaper) {
      case 'blue': return 'bg-[#EBF3FF]/60';
      case 'amber': return 'bg-[#FEF9EC]/80';
      case 'slate': return 'bg-[#F1F3F5]';
      case 'rose': return 'bg-[#FFF0F5]/80';
      case 'teal': return 'bg-[#E5F4F0]';
      case 'charcoal': return 'bg-[#2E2E3A]';
      case 'custom_color':
      case 'custom_img':
        return '';
      default: return 'bg-gray-50/50';
    }
  };

  const getWallpaperStyle = () => {
    if (chatWallpaper === 'custom_color') {
      return { backgroundColor: customWallpaperColor };
    }
    if (chatWallpaper === 'custom_img' && customWallpaperImg) {
      return { 
        backgroundImage: `url(${customWallpaperImg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };

  const messageEndRef = useRef(null);

  const activeEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Scroll to bottom of chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingEmployeeId]);

  // Call timer effect
  useEffect(() => {
    let interval;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Bot response logic
  const triggerBotResponse = (empId) => {
    setTypingEmployeeId(empId);
    setTimeout(() => {
      setTypingEmployeeId(null);
      const possibleReplies = BOT_RESPONSES[empId] || ["Received! Thanks."];
      const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];

      const botMsg = {
        id: Math.random().toString(),
        sender: empId,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        read: false
      };

      setMessages(prev => ({
        ...prev,
        [empId]: [...(prev[empId] || []), botMsg]
      }));

      // Increment unread count if not currently viewed in desktop mode
      if (selectedEmployeeId !== empId) {
        setEmployees(prev => prev.map(e => e.id === empId ? { ...e, unread: e.unread + 1 } : e));
      }

      // Add to timeline
      const newTimeline = {
        id: Math.random().toString(),
        action: 'Sent message',
        target: activeEmployee.name,
        time: 'Just now',
        type: 'call'
      };
      setTimeline(prev => ({
        ...prev,
        [empId]: [newTimeline, ...(prev[empId] || [])]
      }));
    }, 1800);
  };

  // Send Message
  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const newMsg = {
      id: Math.random().toString(),
      sender: 'me',
      text: textToSend,
      replyTo: replyingToMessage ? replyingToMessage.text : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      read: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedEmployeeId]: [...(prev[selectedEmployeeId] || []), newMsg]
    }));

    setInputText('');
    setReplyingToMessage(null);

    // Trigger auto bot reply
    triggerBotResponse(selectedEmployeeId);
  };

  // Start Call Simulation
  const startCall = (type) => {
    setActiveCall({
      type,
      employee: activeEmployee,
      status: 'ringing'
    });

    // Automatically transition from Ringing to Connected
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2000);
  };

  // End Call
  const endCall = () => {
    // Add call log to timeline
    const actionText = activeCall.type === 'video' ? 'Completed video meeting' : 'Completed voice call';
    const log = {
      id: Math.random().toString(),
      action: actionText,
      target: activeCall.employee.name,
      time: 'Just now',
      type: 'call'
    };
    setTimeline(prev => ({
      ...prev,
      [activeCall.employee.id]: [log, ...(prev[activeCall.employee.id] || [])]
    }));

    setActiveCall(null);
  };

  // Assign Task Form Submit
  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Math.random().toString(),
      title: newTaskTitle,
      desc: newTaskDesc,
      dueDate: newTaskDue || new Date().toISOString().split('T')[0],
      priority: newTaskPriority,
      status: 'Upcoming',
      progress: 0,
      assignedBy: 'Super Admin'
    };

    setTasks(prev => ({
      ...prev,
      [selectedEmployeeId]: [newTask, ...(prev[selectedEmployeeId] || [])]
    }));

    // Add activity to timeline
    const log = {
      id: Math.random().toString(),
      action: 'Assigned task',
      target: newTaskTitle,
      time: 'Just now',
      type: 'task'
    };
    setTimeline(prev => ({
      ...prev,
      [selectedEmployeeId]: [log, ...(prev[selectedEmployeeId] || [])]
    }));

    setAssigningTask(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDue('');
  };

  // Mock File Upload Submit
  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newFile = {
      id: Math.random().toString(),
      name: newFileName.toLowerCase().endsWith(`.${newFileType}`) ? newFileName : `${newFileName}.${newFileType}`,
      type: newFileType,
      date: new Date().toISOString().split('T')[0],
      size: '1.2 MB',
      by: 'Super Admin'
    };

    setFiles(prev => ({
      ...prev,
      [selectedEmployeeId]: [newFile, ...(prev[selectedEmployeeId] || [])]
    }));

    // Add message alert in chat for shared file
    const fileMsg = {
      id: Math.random().toString(),
      sender: 'me',
      text: `Shared file: ${newFile.name}`,
      isFile: true,
      fileName: newFile.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      read: true
    };
    setMessages(prev => ({
      ...prev,
      [selectedEmployeeId]: [...(prev[selectedEmployeeId] || []), fileMsg]
    }));

    // Add log
    const log = {
      id: Math.random().toString(),
      action: 'Uploaded task file',
      target: newFile.name,
      time: 'Just now',
      type: 'document'
    };
    setTimeline(prev => ({
      ...prev,
      [selectedEmployeeId]: [log, ...(prev[selectedEmployeeId] || [])]
    }));

    setUploadingFile(false);
    setNewFileName('');
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (creationType === 'dm') {
      if (!newEmpName.trim() || !newEmpId.trim()) return;
      const cleanId = newEmpId.trim().toUpperCase();
      if (employees.some(emp => emp.id.toUpperCase() === cleanId)) {
        alert("Employee ID already exists in workspace!");
        return;
      }

      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newEmp = {
        id: cleanId,
        name: newEmpName.trim(),
        designation: newEmpRole.trim() || 'Software Engineer',
        department: newEmpDept,
        email: `${newEmpName.toLowerCase().replace(/\s+/g, '')}@storyseed.com`,
        phone: '+91 99999 11111',
        joiningDate: new Date().toISOString().split('T')[0],
        project: 'Super Admin Portal',
        manager: 'Deva',
        thoughtOfTheDay: newEmpThought.trim() || 'Building things with love and code.',
        avatarColor: randomColor,
        status: 'offline',
        unread: 0,
        favorite: false
      };

      setEmployees(prev => [...prev, newEmp]);
      
      // Initialize messages block
      setMessages(prev => ({
        ...prev,
        [cleanId]: [
          {
            id: Math.random().toString(),
            sender: cleanId,
            text: `Hello! I have joined the secure Storyseed workspace. My Employee ID is ${cleanId}. Let's collaborate.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            read: false
          }
        ]
      }));

      setSelectedEmployeeId(cleanId);
      setProfileEmployeeId(cleanId);
      setCreationModalOpen(false);
    } else {
      if (!newEmpName.trim()) return;
      const randomId = `group_${Math.random().toString(36).substr(2, 9)}`;

      const newGroup = {
        id: randomId,
        name: newEmpName.trim(),
        designation: 'Group Chat',
        department: 'Engineering',
        avatarColor: 'bg-indigo-600',
        status: 'online',
        unread: 0,
        favorite: false,
        isGroup: true,
        members: newGroupMembers.length > 0 ? newGroupMembers : ['Deva']
      };

      setEmployees(prev => [...prev, newGroup]);
      
      setMessages(prev => ({
        ...prev,
        [randomId]: [
          {
            id: Math.random().toString(),
            sender: 'system',
            text: `Group workspace "${newEmpName}" established. Members: ${newGroup.members.join(', ')}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            read: true
          }
        ]
      }));

      setSelectedEmployeeId(randomId);
      setProfileEmployeeId(randomId);
      setCreationModalOpen(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, favorite: !e.favorite } : e));
  };

  // Star message
  const toggleStarMessage = (msgId) => {
    setStarredMessages(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Filtered employees listing
  const filteredEmployees = employees.filter(emp => {
    if (emp.id === currentUser.id) return false;
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedDeptFilter === 'All' || emp.department === selectedDeptFilter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500';
      case 'In Progress': return 'bg-amber-500';
      case 'Overdue': return 'bg-rose-500';
      case 'Upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const activeMessages = messages[selectedEmployeeId] || [];
  const activeTasks = tasks[selectedEmployeeId] || [];
  const activeFiles = files[selectedEmployeeId] || [];
  const activeTimeline = timeline[selectedEmployeeId] || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#F8FAFC] text-gray-900 flex flex-col items-center justify-center p-4 relative font-inter overflow-hidden">
        {/* Glow gradients background */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-650/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-gray-150 rounded-[2rem] p-8 shadow-xl relative z-10 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Back to main page arrow button */}
          <button 
            onClick={() => window.location.href = '/'}
            className="absolute top-6 left-6 p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors border border-gray-100 hover:border-gray-200 shadow-sm bg-white"
            title="Go to main page"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex flex-col items-center text-center mt-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Hub Terminal Gate</h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed px-4">
              Enter your assigned Employee ID and passcode signature to establish a secure encrypted connection.
            </p>
          </div>

          {connecting ? (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-xs text-gray-500 font-mono animate-pulse">{connectStep}</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-1092"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secret Passkey</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 relative font-inter rounded-none border-none">
      
      {/* ── 1. LEFT SIDEBAR (Chats List) ── */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col shrink-0 ${mobileViewMode === 'list' ? 'block' : 'hidden md:flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center shrink-0 border border-transparent hover:border-gray-200"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setStarredMessagesOpen(true)}
                className="p-2 hover:bg-gray-55/50 rounded-xl text-gray-400 hover:text-amber-500 transition-colors"
                title="Starred Messages"
              >
                <Star size={16} />
              </button>
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2 hover:bg-gray-55/50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button 
                onClick={() => {
                  setNewEmpName('');
                  setNewEmpId('');
                  setNewEmpRole('');
                  setNewEmpThought('');
                  setNewGroupMembers([]);
                  setCreationModalOpen(true);
                }}
                className="p-2 hover:bg-gray-55/50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors"
                title="New Chat / Group"
              >
                <Plus size={16} />
              </button>
              {/* Current Logged In User Profile Avatar */}
              <button 
                onClick={() => {
                  setProfileEmployeeId(currentUser.id);
                  setShowRightSidebar(true);
                  if (mobileViewMode === 'list') {
                    setMobileViewMode('details');
                  }
                }}
                className="w-8 h-8 rounded-full hover:scale-105 active:scale-95 transition-all ring-2 ring-blue-500/10 cursor-pointer ml-1 overflow-hidden"
                title={`My Profile (${currentUser.name})`}
              >
                {renderAvatar(currentUser, "w-full h-full text-[10px]")}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* Department Filters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['All', 'Engineering', 'HR', 'Design', 'Marketing'].map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${selectedDeptFilter === dept ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Favorite Contacts */}
        {filteredEmployees.some(e => e.favorite) && (
          <div className="px-4 pt-3 pb-1 border-b border-gray-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Favorites</p>
            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
              {filteredEmployees.filter(e => e.favorite).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployeeId(emp.id);
                    setProfileEmployeeId(emp.id);
                    setMobileViewMode('chat');
                    setGroupViewMode('chat');
                    // Reset unread
                    setEmployees(prev => prev.map(x => x.id === emp.id ? { ...x, unread: 0 } : x));
                  }}
                  className="flex flex-col items-center gap-1 focus:outline-none group shrink-0"
                >
                  <div className="relative">
                    {renderAvatar(emp, "w-11 h-11 text-sm shadow-sm group-hover:scale-105 transition-transform")}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${emp.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 truncate w-14 text-center">{emp.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100/50">
          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400 italic">No contacts found</div>
          ) : (
            filteredEmployees.map(emp => {
              const lastMsg = messages[emp.id]?.[messages[emp.id].length - 1];
              const isTyping = typingEmployeeId === emp.id;

              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployeeId(emp.id);
                    setProfileEmployeeId(emp.id);
                    setMobileViewMode('chat');
                    setGroupViewMode('chat');
                    // Reset unread count
                    setEmployees(prev => prev.map(x => x.id === emp.id ? { ...x, unread: 0 } : x));
                  }}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50/70 transition-colors ${selectedEmployeeId === emp.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {renderAvatar(emp, "w-11 h-11 text-sm")}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${emp.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>

                  {/* Body info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900 truncate">{emp.name}</p>
                      <p className="text-[10px] text-gray-400 shrink-0">{lastMsg ? lastMsg.time : ''}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">{emp.designation}</p>
                    
                    {/* Message Snippet */}
                    <div className="mt-1 flex items-center justify-between">
                      {isTyping ? (
                        <span className="text-xs text-blue-600 font-semibold italic animate-pulse">typing...</span>
                      ) : (
                        <p className="text-xs text-gray-500 truncate pr-4">
                          {lastMsg ? (lastMsg.sender === 'me' ? 'You: ' : '') + lastMsg.text : 'Start a conversation'}
                        </p>
                      )}

                      {/* Unread badge / Favorite star */}
                      <div className="flex items-center gap-1.5">
                        {emp.unread > 0 && (
                          <span className="bg-blue-600 text-white font-bold text-[10px] h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center shrink-0">
                            {emp.unread}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(emp.id); }}
                          className={`text-gray-300 hover:text-amber-500 transition-colors ${emp.favorite ? 'text-amber-500' : ''}`}
                        >
                          <Star size={12} fill={emp.favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 2. CENTER PANEL (Main Chat Area) ── */}
      {!selectedEmployeeId ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-center p-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-4 animate-pulse">
            <MessageSquare size={30} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Establish a Secure Workspace Connection</h3>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            Select a team member from the left conversations panel or favorite list to start messaging, assign tasks, and share files.
          </p>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col bg-[#F8FAFC] border-r border-gray-200 overflow-hidden ${mobileViewMode === 'chat' ? 'block' : 'hidden md:flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 relative z-10 shadow-sm shadow-gray-100/50">
          <div className="flex items-center gap-3">
            {/* Back button for mobile view */}
            <button 
              onClick={() => setMobileViewMode('list')}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              <ArrowLeft size={18} />
            </button>

            <div 
              onClick={() => {
                setShowRightSidebar(prev => !prev);
                if (mobileViewMode === 'chat') {
                  setMobileViewMode('details');
                }
              }}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-xl transition-all"
              title="View Contact Info"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activeEmployee.avatarColor}`}>
                  {activeEmployee.isGroup ? <Users size={16} /> : activeEmployee.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${activeEmployee.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
                  {activeEmployee.name}
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.25 rounded">
                    {activeEmployee.department}
                  </span>
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {activeEmployee.designation} · {activeEmployee.status === 'online' ? 'Active now' : 'Away'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => startCall('voice')}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-blue-600 transition-colors"
              title="Voice Call"
            >
              <Phone size={16} />
            </button>
            <button 
              onClick={() => startCall('video')}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-blue-600 transition-colors"
              title="Video Call"
            >
              <Video size={16} />
            </button>
            <button 
              onClick={() => setMessageSearchOpen(!messageSearchOpen)}
              className={`p-2 rounded-xl transition-colors ${messageSearchOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              title="Search Messages"
            >
              <Search size={16} />
            </button>
            <button 
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="hidden lg:block p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-900 transition-colors"
              title="Toggle Workspace Sidebar"
            >
              <MoreVertical size={16} />
            </button>

            {/* Mobile Workspace details trigger */}
            <button 
              onClick={() => setMobileViewMode('details')}
              className="md:hidden p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {activeEmployee.isGroup && (
          <div className="flex border-b border-gray-200 bg-white shrink-0 relative z-10 animate-in fade-in duration-200">
            <button
              onClick={() => setGroupViewMode('chat')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 text-center uppercase tracking-wider transition-colors ${groupViewMode === 'chat' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-455 hover:text-gray-900'}`}
            >
              Group Chat
            </button>
            <button
              onClick={() => setGroupViewMode('tasks')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 text-center uppercase tracking-wider transition-colors ${groupViewMode === 'tasks' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-455 hover:text-gray-900'}`}
            >
              Task Report
            </button>
          </div>
        )}

        {/* Message Search Sub-bar */}
        {messageSearchOpen && (
          <div className="px-6 py-2 bg-white border-b border-gray-100 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-150 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search text in messages..."
                value={messageSearchTerm}
                onChange={e => setMessageSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 h-8 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={() => { setMessageSearchOpen(false); setMessageSearchTerm(''); }}
              className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
            >
              Close
            </button>
          </div>
        )}

        {/* Chat Messages Stream or Task Report */}
        {activeEmployee.isGroup && groupViewMode === 'tasks' ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-gray-50/50">
            {/* Task Report Summary Card */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex flex-col gap-2">
                <h4 className="text-base font-bold text-gray-900">{activeEmployee.name} Performance</h4>
                <p className="text-xs text-gray-550 leading-relaxed max-w-md">
                  Overall status metrics showing progress of assigned milestone objectives and deliverables for this team workspace.
                </p>
                <div className="flex gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">{activeTasks.length}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Tasks</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-emerald-600">{activeTasks.filter(t => t.status === 'Completed').length}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Completed</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-amber-600">{activeTasks.filter(t => t.status === 'In Progress').length}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">In Progress</span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              {(() => {
                const total = activeTasks.length || 1;
                const completed = activeTasks.filter(t => t.status === 'Completed').length;
                const pct = Math.round((completed / total) * 100);
                return (
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#2563eb" strokeWidth="8" fill="none" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * pct) / 100} className="transition-all duration-500" />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-800">{pct}%</span>
                  </div>
                );
              })()}
            </div>

            {/* Milestones list */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Active Milestones</h4>
                <button
                  onClick={() => setAssigningTask(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm transition-all"
                >
                  <Plus size={12} /> Assign Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTasks.map(task => (
                  <div key={task.id} className="p-5 bg-white border border-gray-150 rounded-2xl shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg text-white ${
                        task.status === 'Completed' ? 'bg-emerald-500' :
                        task.status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{task.title}</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.desc}</p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Due: {task.dueDate}</span>
                      <span>By: {task.assignedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages Stream */}
            <div 
              className={`flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar transition-all duration-300 ${getWallpaperClass()}`}
              style={getWallpaperStyle()}
            >
          
          {/* Timeline load spacer (Simulates infinite scroll trigger) */}
          <div className="text-center py-2 shrink-0">
            <span className="text-[10px] font-bold text-gray-400/80 bg-white border border-gray-100/80 px-3 py-1 rounded-full shadow-sm">
              Load past conversation logs
            </span>
          </div>

          {activeMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 bg-[#EEF0FF] rounded-2xl flex items-center justify-center text-[#4c58fa]">
                <MessageSquare size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">No messages yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Send a message to start the workspace conversation.</p>
              </div>
            </div>
          ) : (
            activeMessages
              .filter(msg => !messageSearchTerm || msg.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))
              .map((msg, index) => {
                const isMe = msg.sender === 'me';
                const isStarred = starredMessages[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group max-w-lg ${isMe ? 'self-end' : 'self-start'}`}
                  >
                    {/* Reply tag context */}
                    {msg.replyTo && (
                      <div className="text-[10px] text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-t-lg border-l-2 border-blue-500 -mb-1 flex items-center gap-1 font-medium">
                        <Reply size={10} className="scale-x-[-1]" />
                        <span>Replied to: &quot;{msg.replyTo}&quot;</span>
                      </div>
                    )}

                    {/* Chat Bubble container */}
                    <div className="flex items-center gap-2">
                      
                      {/* Bubble Action tools shown on hover */}
                      {!isMe && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => setReplyingToMessage(msg)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
                            title="Reply"
                          >
                            <Reply size={12} />
                          </button>
                          <button
                            onClick={() => toggleStarMessage(msg.id)}
                            className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${isStarred ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                            title="Star Message"
                          >
                            <Star size={12} fill={isStarred ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      )}

                      {/* Bubble Bubble */}
                      <div className={`p-3.5 rounded-2xl shadow-sm text-sm relative leading-relaxed ${
                        isMe 
                          ? 'bg-[#2563EB] text-white rounded-tr-none' 
                          : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                      }`}>
                        
                        {/* File preview inside message if file type */}
                        {msg.isFile ? (
                          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-black/5 min-w-48 mb-1.5">
                            <div className="w-9 h-9 rounded-lg bg-[#EEF0FF] flex items-center justify-center text-blue-600 shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate leading-snug">{msg.fileName}</p>
                              <p className="text-[10px] opacity-70">Shared document</p>
                            </div>
                          </div>
                        ) : null}

                        <p>{msg.text}</p>
                        
                        {/* Star marker inside bubble */}
                        {isStarred && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full p-0.5 border border-white shadow-sm">
                            <Star size={8} fill="currentColor" />
                          </span>
                        )}
                      </div>

                      {isMe && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => setReplyingToMessage(msg)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
                            title="Reply"
                          >
                            <Reply size={12} />
                          </button>
                          <button
                            onClick={() => toggleStarMessage(msg.id)}
                            className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${isStarred ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                            title="Star Message"
                          >
                            <Star size={12} fill={isStarred ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata line (Time, read receipts) */}
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider px-1">
                      <span>{msg.time}</span>
                      {isMe && (
                        <span className="text-blue-500">
                          <CheckCheck size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
          )}

          {/* Typing Indicator */}
          {typingEmployeeId === selectedEmployeeId && (
            <div className="flex items-start gap-2 max-w-xs self-start animate-pulse">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] ${activeEmployee.avatarColor}`}>
                {activeEmployee.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-9">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Replying Context Bar */}
        {replyingToMessage && (
          <div className="px-6 py-2.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-bold text-[#2563EB]">Replying to {replyingToMessage.sender === 'me' ? 'yourself' : activeEmployee.name}:</p>
              <p className="text-gray-600 truncate mt-0.5">&quot;{replyingToMessage.text}&quot;</p>
            </div>
            <button 
              onClick={() => setReplyingToMessage(null)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Bottom Composer */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-center gap-3 relative z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-1 shrink-0">
            
            {/* Attachment Button */}
            <button 
              onClick={() => setUploadingFile(true)}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-800 transition-colors"
              title="Add attachment"
            >
              <Paperclip size={18} />
            </button>

            {/* Camera mock trigger */}
            <button 
              onClick={() => alert('Mock Camera Trigger: Feature pending system camera permissions.')}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-800 transition-colors"
              title="Use Camera"
            >
              <Camera size={18} />
            </button>

            {/* Voice record trigger */}
            <button 
              onClick={() => {
                setInputText('🎤 Voice Note (0:08) - Uploaded');
                setTimeout(() => handleSendMessage('🎤 Voice Note (0:08) - Uploaded'), 100);
              }}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-800 transition-colors"
              title="Send voice note"
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type message, use attachments..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            
            {/* Emoji picker simulated button */}
            <button 
              onClick={() => setInputText(prev => prev + ' 👍')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
              title="Add thumbs up emoji"
            >
              <Smile size={18} />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md transition-all shrink-0 ${
              inputText.trim() 
                ? 'bg-[#2563EB] hover:bg-blue-700 shadow-[#2563EB]/20 hover:scale-105 active:scale-95' 
                : 'bg-gray-100 text-gray-450 shadow-none cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        </>
        )}
      </div>
      )}

      {/* ── 3. RIGHT SIDEBAR (Employee Workspace) ── */}
      {(selectedEmployeeId || profileEmployeeId) && (
        <div className={`w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 overflow-y-auto flex flex-col shrink-0 custom-scrollbar ${
          mobileViewMode === 'details' ? 'block' : showRightSidebar ? 'hidden lg:block' : 'hidden'
        }`}>
          
          {/* Right Sidebar Top Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employee Profile</h4>
            <button
              onClick={() => {
                setShowRightSidebar(false);
                setMobileViewMode('chat');
              }}
              className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
              title="Close Profile"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Card Render */}
          {(() => {
            const sidebarEmployee = employees.find(e => e.id === (profileEmployeeId || selectedEmployeeId)) || currentUser;
            const sharedFiles = files[sidebarEmployee.id] || [];
            return (
              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
                  <div className="relative mb-4 group/avatar shrink-0">
                    <div className="w-28 h-28 rounded-full border-4 border-gray-50 overflow-hidden shadow-md flex items-center justify-center bg-gray-100">
                      {renderAvatar(sidebarEmployee, "w-full h-full text-3xl")}
                    </div>
                    {sidebarEmployee.id === currentUser.id && (
                      <button 
                        onClick={() => {
                          setCustomPhotoUrl(currentUser.avatarUrl || '');
                          setIsEditingPhoto(true);
                        }}
                        className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white"
                        title="Change Profile Photo"
                      >
                        <Camera size={24} />
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug">{sidebarEmployee.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                    {sidebarEmployee.isGroup ? 'Group Workspace' : sidebarEmployee.designation}
                  </p>
                </div>

                {/* Profile Details Block */}
                <div className="space-y-4 text-sm bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Employee ID</span>
                    <span className="text-gray-900 font-semibold font-mono text-base">{sidebarEmployee.id}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Department</span>
                    <span className="text-gray-900 font-semibold">{sidebarEmployee.department}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Description</span>
                    <span className="text-gray-650 font-medium leading-relaxed">
                      {sidebarEmployee.isGroup 
                        ? 'Secure, encrypted team communications socket for the Core Platform Engineering Team.' 
                        : `${sidebarEmployee.name} works as the ${sidebarEmployee.designation} inside our ${sidebarEmployee.department} department.`}
                    </span>
                  </div>

                  {/* Thought of the Day Section */}
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-150">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Thought of the Day</span>
                    <div className="bg-white border border-gray-100 rounded-xl p-3.5 italic text-gray-650 text-xs leading-relaxed shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      &quot;{sidebarEmployee.thoughtOfTheDay || 'Always strive to build clean, maintainable, and high-quality software products.'}&quot;
                    </div>
                  </div>

                  {/* Shared Files & Documents Section */}
                  {sidebarEmployee.id !== currentUser.id && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-150">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Shared Files & Documents</span>
                      {sharedFiles.length === 0 ? (
                        <div className="text-center py-3 text-xs text-gray-450 italic">No shared documents found.</div>
                      ) : (
                        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                          {sharedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                  <FileText size={15} />
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-bold text-gray-900 truncate leading-none">{file.name}</p>
                                  <p className="text-[9px] text-gray-400 mt-1">{file.size} · {file.date}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => alert(`Simulated document download: ${file.name}`)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-55 rounded-lg transition-colors shrink-0"
                                title="Download"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarEmployee.isGroup && sidebarEmployee.members && (
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-150">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Members</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {sidebarEmployee.members.map(member => (
                          <span key={member} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}



      {/* ── Call Simulator Modal Overlay ── */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0f172a] text-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6 flex flex-col items-center justify-between min-h-[500px]"
            >
              {/* Call Header info */}
              <div className="text-center flex flex-col items-center mt-6">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center text-white font-bold text-2xl shadow-xl ${activeCall.employee.avatarColor}`}>
                    {activeCall.employee.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-[#0f172a]">
                    <Zap size={10} fill="currentColor" />
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{activeCall.employee.name}</h3>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-semibold">{activeCall.employee.designation}</p>
                <span className="bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold px-2 py-0.5 rounded mt-2.5">
                  {activeCall.employee.department}
                </span>
              </div>

              {/* Status Indicator & Waves */}
              <div className="flex flex-col items-center gap-3">
                {activeCall.status === 'ringing' ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold text-blue-400 animate-pulse">Ringing...</p>
                    <div className="flex gap-1 items-center justify-center h-8">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="w-1 bg-blue-500 rounded-full animate-bounce h-3" style={{ animationDelay: `${i*150}ms` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Connected · {activeCall.type.toUpperCase()}</p>
                    <p className="text-3xl font-mono tracking-wider font-semibold text-white/90">
                      {formatCallTime(callTimer)}
                    </p>
                    {/* Simulated Voice Waveform */}
                    <div className="flex gap-1.5 items-center justify-center h-12">
                      {[...Array(9)].map((_, i) => {
                        const h = [24, 16, 40, 20, 48, 28, 36, 12, 20][i];
                        return (
                          <span 
                            key={i} 
                            className="w-1.2 bg-emerald-400 rounded-full animate-pulse" 
                            style={{ 
                              height: `${h}px`,
                              animationDuration: `${[800, 1100, 700, 1300, 900, 1500, 600, 1200, 1000][i]}ms` 
                            }} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toggles & End Button */}
              <div className="w-full flex flex-col gap-6 items-center border-t border-white/5 pt-6 mb-2">
                <div className="flex items-center gap-6">
                  <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">
                    <Mic size={18} />
                  </button>
                  <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">
                    <Video size={18} />
                  </button>
                  <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">
                    <Settings size={18} />
                  </button>
                </div>

                <button
                  onClick={endCall}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
                >
                  <X size={24} />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Assign Task Form Modal ── */}
      <AnimatePresence>
        {assigningTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-[#2563EB] px-6 py-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">Assign Task to {activeEmployee.name}</h3>
                <button onClick={() => setAssigningTask(false)} className="text-white/80 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleAssignTask} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Implement Oauth flow"
                    required
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value)}
                    className="input w-full bg-white select"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Deadline</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={e => setNewTaskDue(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Instructions</label>
                  <textarea
                    placeholder="Provide details or links..."
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="input w-full h-24 py-2 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningTask(false)}
                    className="btn-secondary text-xs h-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors h-10"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Share Document Form Modal ── */}
      <AnimatePresence>
        {uploadingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            >
              <div className="bg-[#2563EB] px-6 py-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">Share Document</h3>
                <button onClick={() => setUploadingFile(false)} className="text-white/80 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleFileUpload} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. spec_sheet"
                    required
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">File Type</label>
                  <select
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    className="input w-full bg-white select"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="xlsx">Excel Sheet (.xlsx)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="zip">Compressed Folder (.zip)</option>
                    <option value="png">Image Asset (.png)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setUploadingFile(false)}
                    className="btn-secondary text-xs h-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors h-10"
                  >
                    Upload & Share
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Starred Messages Sidebar Drawer ── */}
      <AnimatePresence>
        {starredMessagesOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  Starred Messages
                </h3>
                <button 
                  onClick={() => setStarredMessagesOpen(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Starred items list */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100/60 custom-scrollbar pr-1">
                {Object.keys(starredMessages).filter(k => starredMessages[k]).length === 0 ? (
                  <div className="text-center py-20 text-sm text-gray-400 italic">No starred messages found.</div>
                ) : (
                  Object.keys(starredMessages)
                    .filter(k => starredMessages[k])
                    .map(msgId => {
                      // Lookup message in initial messages or current state
                      const allMsgs = Object.values(messages).flat();
                      const msg = allMsgs.find(m => m.id === msgId);
                      if (!msg) return null;

                      return (
                        <div key={msgId} className="py-3 flex flex-col gap-1 text-sm">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <span>{msg.sender === 'me' ? 'You' : activeEmployee.name}</span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50 mt-1 leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Settings Sidebar Drawer ── */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Settings size={18} className="text-blue-600" />
                  Settings
                </h3>
                <button 
                  onClick={() => setSettingsOpen(false)}
                  className="p-1.5 hover:bg-gray-55 rounded-lg text-gray-400 hover:text-gray-950 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Settings navigation tabs */}
              <div className="flex border-b border-gray-150 mb-4 shrink-0">
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'chats', label: 'Chats' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center uppercase tracking-wider transition-all duration-150 ${
                      activeSettingsTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Settings content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-5">
                {activeSettingsTab === 'profile' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50 relative">
                      <div className="relative mb-3 group/settingsAvatar">
                        <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center bg-gray-200">
                          {renderAvatar(currentUser, "w-full h-full text-2xl")}
                        </div>
                        <button 
                          onClick={() => {
                            setCustomPhotoUrl(currentUser.avatarUrl || '');
                            setIsEditingPhoto(true);
                          }}
                          className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover/settingsAvatar:opacity-100 transition-opacity cursor-pointer text-white"
                          title="Change Profile Photo"
                        >
                          <Camera size={18} />
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-gray-900">{currentUser.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">{currentUser.designation}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={currentUser.name}
                        onChange={e => {
                          const val = e.target.value;
                          setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? { ...emp, name: val } : emp));
                        }}
                        className="input w-full text-sm font-semibold"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</label>
                      <input
                        type="text"
                        value={currentUser.designation}
                        onChange={e => {
                          const val = e.target.value;
                          setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? { ...emp, designation: val } : emp));
                        }}
                        className="input w-full text-sm"
                        placeholder="Your job role"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thought of the Day</label>
                      <textarea
                        value={currentUser.thoughtOfTheDay || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? { ...emp, thoughtOfTheDay: val } : emp));
                        }}
                        className="input w-full text-sm h-20 py-2.5 resize-none leading-relaxed"
                        placeholder="Share something inspirational..."
                      />
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'chats' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chat Wallpaper</label>
                      <p className="text-[11px] text-gray-500 leading-relaxed -mt-1.5">Change the background styling of active chat feeds.</p>
                      
                      {/* Presets Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[
                          { id: 'default', label: 'Default Gray', bgClass: 'bg-gray-100 border-gray-200' },
                          { id: 'blue', label: 'Soft Blue', bgClass: 'bg-[#EBF3FF] border-[#BFDBFE]' },
                          { id: 'amber', label: 'Warm Amber', bgClass: 'bg-[#FEF9EC] border-[#FDE68A]' },
                          { id: 'slate', label: 'Slate Plain', bgClass: 'bg-[#F1F3F5] border-gray-300' },
                          { id: 'rose', label: 'Light Rose', bgClass: 'bg-[#FFF0F5] border-[#FBCFE8]' },
                          { id: 'teal', label: 'Teal Forest', bgClass: 'bg-[#E5F4F0] border-[#A7F3D0]' },
                          { id: 'charcoal', label: 'Deep Charcoal', bgClass: 'bg-[#2E2E3A] border-gray-900' },
                          { id: 'custom_color', label: 'Custom Color', bgClass: 'bg-gradient-to-r from-cyan-400 to-indigo-500 border-gray-200' },
                          { id: 'custom_img', label: 'Image URL', bgClass: 'bg-gray-200 border-gray-300' }
                        ].map(wp => (
                          <button
                            key={wp.id}
                            type="button"
                            onClick={() => setChatWallpaper(wp.id)}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 text-gray-700 cursor-pointer ${
                              chatWallpaper === wp.id ? 'ring-2 ring-blue-500/20 border-blue-600 shadow-sm' : 'border-gray-150'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${wp.bgClass}`} />
                            <span className="truncate">{wp.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Settings */}
                      {chatWallpaper === 'custom_color' && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 animate-in slide-in-from-top-2 duration-150">
                          <span className="text-xs font-bold text-gray-600">Pick Custom Color:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customWallpaperColor}
                              onChange={e => setCustomWallpaperColor(e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                            />
                            <input
                              type="text"
                              value={customWallpaperColor}
                              onChange={e => setCustomWallpaperColor(e.target.value)}
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                              placeholder="#e0f2fe"
                            />
                          </div>
                        </div>
                      )}

                      {/* Custom Image Settings */}
                      {chatWallpaper === 'custom_img' && (
                        <div className="flex flex-col gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 animate-in slide-in-from-top-2 duration-150">
                          <span className="text-xs font-bold text-gray-600">Background Image URL:</span>
                          <input
                            type="text"
                            value={customWallpaperImg}
                            onChange={e => setCustomWallpaperImg(e.target.value)}
                            placeholder="e.g. https://example.com/wallpaper.jpg"
                            className="input w-full text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Enter Key to Send</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Pressing Enter will send message directly.</p>
                      </div>
                      <Toggle on={true} onToggle={() => {}} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer System Meta */}
              <div className="border-t border-gray-100 pt-4 mt-auto text-[10px] text-gray-400 text-center flex flex-col gap-0.5 shrink-0">
                <span className="font-bold text-gray-500">Storyseed Hub Node v1.4.2</span>
                <span>Secure SSL Encryption Enabled · Session: {currentUser.id}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Change Profile Photo Preset Modal ── */}
      <AnimatePresence>
        {isEditingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            >
              <div className="bg-[#2563EB] px-6 py-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">Update Profile Photo</h3>
                <button onClick={() => setIsEditingPhoto(false)} className="text-white/80 hover:text-white font-bold">✕</button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Portrait Preset</label>
                  <div className="grid grid-cols-5 gap-3 mt-1">
                    {[
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
                    ].map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomPhotoUrl(url)}
                        className={`aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          customPhotoUrl === url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-gray-200'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Custom Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={customPhotoUrl}
                    onChange={e => setCustomPhotoUrl(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingPhoto(false)}
                    className="btn-secondary text-xs h-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmployees(prev => prev.map(e => e.id === currentUser.id ? { ...e, avatarUrl: customPhotoUrl } : e));
                      setIsEditingPhoto(false);
                    }}
                    className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors h-10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── WhatsApp-like Direct Message & Group Creator Modal ── */}
      <AnimatePresence>
        {creationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            >
              <div className="bg-[#2563EB] px-6 py-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare size={20} />
                  New Workspace Socket
                </h3>
                <button onClick={() => setCreationModalOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
              </div>

              {/* Creator Mode Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreationType('dm')}
                  className={`flex-1 py-3 text-xs font-bold text-center uppercase tracking-wider transition-colors ${
                    creationType === 'dm' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  New Direct Chat
                </button>
                <button
                  type="button"
                  onClick={() => setCreationType('group')}
                  className={`flex-1 py-3 text-xs font-bold text-center uppercase tracking-wider transition-colors ${
                    creationType === 'group' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  New Group Workspace
                </button>
              </div>

              <form onSubmit={handleCreateWorkspace} className="p-6 flex flex-col gap-4">
                {creationType === 'dm' ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Employee Name</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        required
                        value={newEmpName}
                        onChange={e => setNewEmpName(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Employee Workspace ID</label>
                      <input
                        type="text"
                        placeholder="e.g. EMP-1123"
                        required
                        value={newEmpId}
                        onChange={e => setNewEmpId(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Department</label>
                        <select
                          value={newEmpDept}
                          onChange={e => setNewEmpDept(e.target.value)}
                          className="input w-full bg-white select"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="HR">HR</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Designation / Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Engineer"
                          required
                          value={newEmpRole}
                          onChange={e => setNewEmpRole(e.target.value)}
                          className="input w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Thought / Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Coding is life."
                        value={newEmpThought}
                        onChange={e => setNewEmpThought(e.target.value)}
                        className="input w-full"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Group Workspace Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Design Sprint Team"
                        required
                        value={newEmpName}
                        onChange={e => setNewEmpName(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Select Group Members</label>
                      <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto flex flex-col gap-2 bg-gray-50/50">
                        {employees.filter(e => !e.isGroup && e.id !== currentUser.id).map(emp => {
                          const isChecked = newGroupMembers.includes(emp.name);
                          return (
                            <label key={emp.id} className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNewGroupMembers(prev => prev.filter(m => m !== emp.name));
                                  } else {
                                    setNewGroupMembers(prev => [...prev, emp.name]);
                                  }
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span>{emp.name} ({emp.designation})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setCreationModalOpen(false)}
                    className="btn-secondary text-xs h-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors h-10"
                  >
                    Create Connection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
