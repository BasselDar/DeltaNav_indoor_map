// Room names, details, and helpers for indoor navigation

export const ROOM_NAMES: Record<string, string> = {
  "401": "Dean",
  "402": "Secretary",
  "403": "V.Dean",
  "405": "Library",
  "406": "Control",
  "407": "Control",
  "408": "Teaching assistant (Basic Computer & scince Dept)",
  "409": "Teaching assistant (A.I Dept)",
  "410": "Lab. 1",
  "411": "Lab. 2",
  "412": "Lab. 3",
  "413": "Quality assurance Unit",
  "414": "Lab. 4",
  "415": "Lab (Network & IOT)",
  "416": "Lab (Robotic & Project)",
  "417": "Lab (Digital Logic and Embedded )",
  "418": "Work-Based Project Lab. 1 ",
  "419": "A.I-Head",
  "420": "Lab.5",
  "421": "Lab.6",
  "422": "C.Sec-Head",
  "423": "Lab (Bioinformatics & Healthy informatics)",
  "424": "Work-Based Project Lab. 2",
  "425": "",
  "426": "Teaching assistant (Bio and security Dept)",
  "427": "Teaching Staff",
  "428": "Lab. 7",
  "429": "Teaching Staff",
  "430": "Teaching Staff",
  "431": "Utilities",
  "432": "Teaching Staff",
  "433": "Bioinformatics Department",
  "434": "Teaching Staff",
  "435": "Hall 7",
  "436": "E-Learn",
  "437": "Academic Guidance Unit",
  "438": "Hall 8"
};

export const ROOM_DETAILS: Record<string, { name: string, description: string, workingHours?: string, contact?: string }> = {
  "401": { name: "Dean", description: "Dean's Office - Administrative headquarters. For all your academic needs.", workingHours: "Sun-Thu: 9am-4pm", contact: "dean@univ.edu" },
  "402": { name: "Secretary", description: "Secretary's Office. Paperwork and more!", workingHours: "Sun-Thu: 9am-3pm", contact: "secretary@univ.edu" },
  "403": { name: "Vice Dean", description: "Vice Dean's Office. Second in command.", workingHours: "Sun-Thu: 9am-4pm", contact: "vdean@univ.edu" },
  "405": { name: "Library", description: "Library and study area. Quiet zone!", workingHours: "Sun-Thu: 8am-6pm", contact: "library@univ.edu" },
  "406": { name: "Control", description: "Control Room. For authorized personnel only.", workingHours: "24/7", contact: "control@univ.edu" },
  "407": { name: "Control", description: "Control Room. For authorized personnel only.", workingHours: "24/7", contact: "control@univ.edu" },
  "408": { name: "TA (Basic Comp. & Science)", description: "TA Office - Basic Computer & Science Dept. Always happy to help!", workingHours: "Sun-Thu: 10am-2pm", contact: "ta.basic@univ.edu" },
  "409": { name: "TA (A.I Dept)", description: "TA Office - A.I Dept. Ask us about AI!", workingHours: "Sun-Thu: 10am-2pm", contact: "ta.ai@univ.edu" },
  "410": { name: "Lab. 1", description: "General Computer Lab. Open for all students.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab1@univ.edu" },
  "411": { name: "Lab. 2", description: "Advanced Computer Lab. For project work.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab2@univ.edu" },
  "412": { name: "Lab. 3", description: "Programming Lab. Code your dreams!", workingHours: "Sun-Thu: 9am-5pm", contact: "lab3@univ.edu" },
  "413": { name: "Quality Assurance Unit", description: "QA Unit. Ensuring excellence.", workingHours: "Sun-Thu: 10am-3pm", contact: "qa@univ.edu" },
  "414": { name: "Lab. 4", description: "Hardware Lab. Tinker and build.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab4@univ.edu" },
  "415": { name: "Network & IoT Lab", description: "Network & IoT Lab. Connect everything!", workingHours: "Sun-Thu: 9am-5pm", contact: "iot@univ.edu" },
  "416": { name: "Robotics & Project Lab", description: "Robotics & Project Lab. Robots welcome.", workingHours: "Sun-Thu: 9am-5pm", contact: "robotics@univ.edu" },
  "417": { name: "Digital Logic & Embedded Lab", description: "Digital Logic & Embedded Lab. Circuits galore!", workingHours: "Sun-Thu: 9am-5pm", contact: "embedded@univ.edu" },
  "418": { name: "Project Lab 1", description: "Work-Based Project Lab 1. Bring your ideas to life.", workingHours: "Sun-Thu: 9am-5pm", contact: "proj1@univ.edu" },
  "419": { name: "A.I Dept Head", description: "A.I Department Head Office. AI questions answered.", workingHours: "Sun-Thu: 10am-3pm", contact: "aihead@univ.edu" },
  "420": { name: "Lab.5", description: "Lab 5. Open workspace.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab5@univ.edu" },
  "421": { name: "Lab.6", description: "Lab 6. Open workspace.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab6@univ.edu" },
  "422": { name: "Cyber-Security Dept Head", description: "Cyber-Security Dept Head Office. Stay safe!", workingHours: "Sun-Thu: 10am-3pm", contact: "cyber@univ.edu" },
  "423": { name: "Bioinformatics & Health Lab", description: "Bioinformatics & Health Informatics Lab. Data meets health.", workingHours: "Sun-Thu: 9am-5pm", contact: "bioinfo@univ.edu" },
  "424": { name: "Project Lab 2", description: "Work-Based Project Lab 2. More space for your ideas.", workingHours: "Sun-Thu: 9am-5pm", contact: "proj2@univ.edu" },
  "425": { name: "", description: "" },
  "426": { name: "TA (Bio & Security)", description: "TA Office - Bio & Security Dept. Ask us anything!", workingHours: "Sun-Thu: 10am-2pm", contact: "ta.bio@univ.edu" },
  "427": { name: "Teaching Staff", description: "Teaching Staff Office. Faculty support.", workingHours: "Sun-Thu: 9am-3pm", contact: "staff@univ.edu" },
  "428": { name: "Lab. 7", description: "Lab 7. For advanced projects.", workingHours: "Sun-Thu: 9am-5pm", contact: "lab7@univ.edu" },
  "429": { name: "Teaching Staff", description: "Teaching Staff Office. Faculty support.", workingHours: "Sun-Thu: 9am-3pm", contact: "staff@univ.edu" },
  "430": { name: "Teaching Staff", description: "Teaching Staff Office. Faculty support.", workingHours: "Sun-Thu: 9am-3pm", contact: "staff@univ.edu" },
  "431": { name: "Utilities", description: "Utilities Room. Maintenance and more.", workingHours: "24/7", contact: "utilities@univ.edu" },
  "432": { name: "Teaching Staff", description: "Teaching Staff Office. Faculty support.", workingHours: "Sun-Thu: 9am-3pm", contact: "staff@univ.edu" },
  "433": { name: "Bioinformatics Dept", description: "Bioinformatics Department Office. Data science hub.", workingHours: "Sun-Thu: 10am-3pm", contact: "bio@univ.edu" },
  "434": { name: "Teaching Staff", description: "Teaching Staff Office. Faculty support.", workingHours: "Sun-Thu: 9am-3pm", contact: "staff@univ.edu" },
  "435": { name: "Hall 7", description: "Large Lecture Hall 7. Big ideas happen here!", workingHours: "Sun-Thu: 8am-8pm", contact: "hall7@univ.edu" },
  "436": { name: "E-Learning Unit", description: "E-Learning Unit. Online resources available.", workingHours: "Sun-Thu: 9am-4pm", contact: "elearn@univ.edu" },
  "437": { name: "Academic Guidance Unit", description: "Academic Guidance Unit. We're here to help you succeed!", workingHours: "Sun-Thu: 10am-3pm", contact: "guidance@univ.edu" },
  "438": { name: "Hall 8", description: "Large Lecture Hall 8. Where the future gathers.", workingHours: "Sun-Thu: 8am-8pm", contact: "hall8@univ.edu" }
};

export const getShortLabelParts = (objectName: string | null): [string, string] => {
  if (!objectName) return ['', ''];
  if (objectName.startsWith('info_')) {
    const num = objectName.replace('info_', '');
    const name = ROOM_NAMES[num] || num;
    // Only show the first word as the name
    const firstWord = name.split(' ')[0];
    return [firstWord, num];
  }
  return [objectName, ''];
}; 