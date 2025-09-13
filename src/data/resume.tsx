import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, PenBoxIcon } from "lucide-react";

export const DATA = {
  name: "Shravan Asati",
  initials: "SA",
  url: "https://shravanasati.pages.dev",
  location: "Ahmedabad, India",
  locationLink: "https://www.google.com/maps/place/ahmedabad",
  description:
    " I am a passionate software developer who's currently studying CSE at Adani University. I love building web servers and CLI tools with Python and Go.",
  summary:
    "",
  avatarUrl: "/me.png",
  skills: [
    "Python",
    "Go",
    "Next.js",
    "Typescript",
    "React",
    "Node.js",
    "Postgres",
    "Docker",
    "Git",
    "Java",
    "C++",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: PenBoxIcon, label: "Blog" },
    { href: "/resume.pdf", icon: NotebookIcon, label: "Resume" },
  ],
  contact: {
    email: "dev.shravan@proton.me",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/shravanasati",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/shravan-asati",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://twitter.com/_softbubble",
        icon: Icons.x,

        navbar: true,
      },
      // Youtube: {
      //   name: "Youtube",
      //   url: "https://dub.sh/dillion-youtube",
      //   icon: Icons.youtube,
      //   navbar: true,
      // },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Toucan Labs",
      href: "https://communitea.toucanlabs.ai",
      badges: [],
      location: "Remote",
      title: "Software Developer Intern",
      logoUrl: "/toucanlabs.jpeg",
      start: "June 2025",
      end: "Aug 2025",
      description:
        "Built and deployed a full-stack observability platform with Grafana Cloud (Loki, Prometheus/Mimir, Tempo) using OpenTelemetry for unified logs, metrics, and traces. Developed a centralized notifications system with in-app center, Firebase push, and admin panel, achieving 97% + real-time delivery to 100+ users. Managed production stack(frontend, backend, MongoDB) on VPS with Dokploy and GitHub Actions CI/ CD, enabling automated zero-downtime blue-green deployments.",
    },
  ],
  education: [
    // Converted from education YAML
    {
      school: "Adani University",
      href: "https://adaniuni.ac.in",
      degree: "B.Tech. in Computer Science & Engineering",
      logoUrl: "/adaniuni.png", 
      start: "2023",
      end: "2027",
      grade: {
        scale: "CGPA",
        achieved: 9.3,
        outOf: 10,
      },
      courses: {
        showGrades: true,
        collapseAfter: 3,
        items: [
          { name: "Data Structures and Algorithm", achieved: 4, outOf: 4 },
          { name: "Frontend Web Development", achieved: 4, outOf: 4 },
          { name: "Python Programming", achieved: 4, outOf: 4 },
        ],
      },
      extracurriculars: [
        "Conducted a session on \"Browser Automation with Selenium\" with an audience of 60+ people on behalf of the coding club.",
        "Won a Gold medal in Carrom during the cultural fest.",
      ],
    },
    // {
    //   school: "VSG International School",
    //   href: "https://vsginternationalschool.in/",
    //   degree: "12th Grade",
    //   logoUrl: "/waterloo.png", // TODO: replace with /images/sections/education/school.webp if asset added
    //   start: "2021",
    //   end: "2023",
    //   grade: {
    //     scale: "Percentage",
    //     achieved: 91.6,
    //     outOf: 100,
    //   },
    // },
  ],
  projects: [
    // Converted from projects YAML
    {
      title: "EveryNyan",
      dates: "September 2024 - Present",
      active: true,
      href: "https://everynyan.vercel.app",
      description: "An anonymous social media website exclusive for Adani University students.",
      technologies: ["nextjs", "react", "shadcn", "tailwind", "go", "firebase"],
      links: [
        { type: "Website", href: "https://everynyan.tech", icon: <Icons.globe className="size-3" /> },
        { type: "YouTube", href: "https://youtu.be/KvFH54cE7OQ", icon: <Icons.youtube className="size-3" /> },
      ],
      image: "/everynyan.png",
    },
    {
      title: "animeviz",
      dates: "February 2024 - Present",
      active: true,
      href: "https://animeviz.ninja",
      description: "A simple website to draw visualizations over your animelists.",
      technologies: ["pandas", "matplotlib", "python", "flask", "picocss", "mysql", "javascript", "api"],
      links: [
        { type: "Website", href: "https://animeviz.ninja", icon: <Icons.globe className="size-3" /> },
        { type: "YouTube", href: "https://youtu.be/JU7f4IIr4nw", icon: <Icons.youtube className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "squirrel",
      dates: "April 2024",
      active: false,
      href: "https://github.com/shravanasati/squirrel",
      description: "A context-aware AI SQL query builder and executor.",
      technologies: ["llm", "ai", "python", "flask", "tailwind", "mysql", "javascript", "ollama"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/squirrel", icon: <Icons.github className="size-3" /> },
        { type: "YouTube", href: "https://youtu.be/ikKFUZu641k", icon: <Icons.youtube className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "stargazer",
      dates: "September 2024",
      active: false,
      href: "https://github.com/shravanasati/stargazer",
      description: "A beauitful and feature-rich astronomy dashboard.",
      technologies: ["3d", "ai", "python", "flask", "tailwind", "react", "javascript"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/stargazer", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "titan-url",
      dates: "May 2021 - Present",
      active: true,
      href: "https://titanurl.vercel.app",
      description: "A no-fuss URL shortener, with a public API. It has a terminal client too.",
      technologies: ["python", "flask", "postgres", "vercel", "nodejs", "tailwindcss", "javascript"],
      links: [
        { type: "Website", href: "https://titanurl.vercel.app", icon: <Icons.globe className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "iris",
      dates: "July 2021 - Present",
      active: true,
      href: "https://github.com/shravanasati/iris",
      description: "An easy-to-use, cross-platform, feature-rich and extremely customizable wallpaper manager.",
      technologies: ["go", "cli", "wallpaper manager"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/iris", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "atomic",
      dates: "Jan 2024 - Present",
      active: true,
      href: "https://github.com/shravanasati/atomic",
      description: "Feature-rich command-line benchmarking tool, written in Go.",
      technologies: ["go", "cli"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/atomic", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "emozi",
      dates: "June 2023 - June 2024",
      active: false,
      href: "https://coral-app-b9pj6.ondigitalocean.app/",
      description: "An emojipasta generator web interface, as well as a CLI. I also maintain the Go library which accomplishes emojipasta generation.",
      technologies: ["go", "library", "cli", "react", "typescript", "web", "docker", "tailwind"],
      links: [
        { type: "Website", href: "https://coral-app-b9pj6.ondigitalocean.app/", icon: <Icons.globe className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "stella",
      dates: "Jun 2021 - Present",
      active: true,
      href: "https://github.com/shravanasati/stellapy",
      description: "CLI utility to streamline your web development experience - live reload for the terminal as well as browser.",
      technologies: ["python", "cli"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/stellapy", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "pyscreenrec",
      dates: "Feb 2021 - May 2021",
      active: false,
      href: "https://pypi.org/project/pyscreenrec",
      description: "A lightweight and cross-platform python library to record screen.",
      technologies: ["python", "library", "opencv"],
      links: [
        { type: "Website", href: "https://pypi.org/project/pyscreenrec", icon: <Icons.globe className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "crusade",
      dates: "Feb 2024 - Present",
      active: true,
      href: "https://github.com/shravanasati/crusade",
      description: "A friendly math interpreter.",
      technologies: ["c++", "data structures"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/crusade", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
    {
      title: "wizard",
      dates: "October 2024",
      active: false,
      href: "https://github.com/shravanasati/wizard",
      description: "A matplotlib-based sorting algorithm visualizer.",
      technologies: ["matplotlib", "algorithms", "python"],
      links: [
        { type: "Source", href: "https://github.com/shravanasati/wizard", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
    },
  ],
  hackathons: [
    {
      title: "Techathon 2025",
      dates: "January 8th - 10th, 2025",
      location: "AIDTM, Ahmedabad",
      description:
        "Awarded first place for building a website focused on road safety and accident prevention, incorporating weather-based insights and community- driven incidents.",
      // image:
        // "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-davis.png",
      // win: "Best Data Hack",
      // mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2018/white.svg",
      links: [
        {
          title: "Website",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://roadsafe.vercel.app",
        },
      ],
    },
    {
      title: "Ingenious 6.0 2025",
      dates: "March 23th - 24th, 2025",
      location: "Ahmedabad University, Ahmedabad",
      description:
        "Built an AI-driven investment platform designed to assist retail investors in making informed financial decisions. It integrates real-time market data, SEBI compliance checks, taxation calculations, and AI-powered stock recommendations to simplify portfolio management.",
      // image:
      // "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-davis.png",
      // win: "Best Data Hack",
      // mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2018/white.svg",
      links: [
        {
          title: "YouTube",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://drive.google.com/file/d/1AkwbuCIhst8KurZCaxvZRYivRC6pbbYo/view?usp=drivesdk",
        },
      ],
    },
  ],
} as const;
