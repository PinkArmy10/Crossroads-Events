# Crossroads Ward Announcements

A modern announcements system for Crossroads Ward, The Church of Jesus Christ of Latter-day Saints.

## 🚀 Features

- **Event Submission** - Ward members can submit events for review
- **Admin Moderation** - Staff can approve, reject, or edit pending events  
- **Resource Links** - Curated ward, YSA, single adult, study, and family history links
- **Contact Directory** - Ward leadership contacts with photos and phone/email
- **Responsive Design** - Works perfectly on phones, tablets, and desktop
- **Real-time Updates** - Firestore-powered live data sync

## 📱 Live Demo

**[Crossroads Ward Announcements](https://your-username.github.io/crossroads-announcements/)**

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- Firebase project

### Local Setup

```bash
git clone https://github.com/your-username/crossroads-announcements.git
cd crossroads-announcements
npm install
```

### Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore** (named database: `crossroads-announcements`)
4. Copy config to `src/firebase.js`
5. Deploy rules: `firebase deploy --only firestore:rules`
6. Create admin user in Authentication

### Run Locally

```bash
npm run dev
```

## 🚀 Deployment

### GitHub Pages

```bash
npm run build
npm run deploy
```

### Firebase Hosting

```bash
npm run firebase:deploy
```

## 📁 File Structure

```
src/
├── components/
│   ├── Layout.jsx          # Navbar + Footer wrapper
│   ├── Footer.jsx          # Site footer disclaimer
│   └── AdminRoute.jsx      # Admin auth guard
├── pages/
│   ├── Home.jsx           # Event announcements list
│   ├── Contact.jsx        # Leadership + Resources
│   ├── Events.jsx         # Event submission form
│   ├── Admin.jsx          # Admin dashboard
│   └── Login.jsx          # Firebase auth
├── context/
│   └── AuthContext.jsx    # Firebase auth state
└── firebase.js            # Firebase config (named database)
```

## 🗄️ Database Schema

### Events Collection

```js
{
  code: "ABCD",              // Lookup code
  title: "Ward Prayer",
  group: "Ward",             // Ward, Elders Quorum, Relief Society, etc.
  startDateTime: "2026-04-06T10:00",
  endDateTime: "2026-04-06T11:00",
  location: "Chapel",
  description: "Weekly ward prayer.",
  postedBy: {
    name: "John Smith",
    email: "john@example.com", 
    phone: "3175550101"
  },
  status: "pending|approved|rejected|needs_changes",
  createdAt: timestamp
}
```

### Link Suggestions Collection

```js
{
  sectionId: "ward",                 // ward, ysa, single-adults, study, family-history
  title: "Building Cleanup Signup",
  url: "https://example.com/signup",
  reason: "Ward cleanup signup sheet.",
  submittedBy: "Jane Doe",
  status: "pending|approved",
  reviewed: true,
  reviewedBy: "admin@example.com",
  createdAt: timestamp
}
```

## 🔒 Security Rules

See `firestore.rules` for production rules. Key permissions:

- ✅ Public: read approved links/events
- ✅ Authenticated: submit events/suggestions
- ✅ Moderator: approve/reject/edit
- ✅ Admin: delete content

## 📱 Responsive Design

| Desktop | Tablet | Mobile |
|---------|--------|--------|
| ![Desktop](screenshots/desktop.png) | ![Tablet](screenshots/tablet.png) | ![Mobile](screenshots/mobile.png) |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Firebase Firestore (named database)
- **Auth**: Firebase Authentication
- **Router**: React Router v6
- **Styling**: CSS (Tailwind-inspired)

## 📸 Screenshots

| Home | Contact | Admin |
|------|---------|-------|
| ![Home](screenshots/home.png) | ![Contact](screenshots/contact.png) | ![Admin](screenshots/admin.png) |

## 🚀 Scripts

```json
{
  "dev": "vite",
  "build": "vite build", 
  "preview": "vite preview",
  "deploy": "gh-pages -d dist",
  "firebase:deploy": "firebase deploy"
}
```

## 📝 License

MIT License - see `LICENSE` file for details.

## 👨‍💻 Author

**Timo Matis** - Webmaster  
*Crossroads Ward Announcements*

---

**⚠️ This system does not replace the official church calendar. This is not an official website of The Church of Jesus Christ of Latter-day Saints.**
