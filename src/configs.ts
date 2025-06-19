const configs = {
  context: "http://localhost:8000/api",
  type: "LIVE", // "LOCAL" or "LIVE"
  appName: "HouseSwitch",
  version: "1.0.0",
  
  // Frontend URLs for QR codes and public forms
  frontendUrl: "http://localhost:3000",
  
  // API endpoints
  endpoints: {
    auth: {
      adminLogin: "/auth/login",
      staffLogin: "/auth/staff/login", 
      contractorLogin: "/auth/contractor/login",
      resetPassword: "/auth/reset-password",
      getCurrentUser: "/auth/me",
      changePassword: "/auth/change-password",  // NEW
      updateProfile: "/auth/profile",  // NEW
    },
    dashboard: {
      adminOverview: "/dashboard/overview",
      staffOverview: "/dashboard/staff/overview",
      contractorOverview: "/dashboard/contractor/overview"
    },
    projects: {
      create: "/projects/create",
      list: "/projects/list",
      getById: "/projects/:id",
      updateStatus: "/projects/:id/status",
      regenerateQR: "/projects/:id/regenerate-qr"
    },
    applications: {
      getByProject: "/projects/:id/applications",
      getById: "/applications/:id",
      updateStatus: "/applications/:id/status"
    },
    staff: {
      create: "/staff/create",
      list: "/staff/list",
      getById: "/staff/:id",        // NEW
      update: "/staff/:id",         // NEW
    },
    contractors: {
      create: "/contractors/create",
      list: "/contractors/list",
      getById: "/contractors/:id",  // NEW
      update: "/contractors/:id",   // NEW
      getApplications: "/contractor/applications",
      updateInstallation: "/contractor/applications/:id/installation",
    },
    public: {
      getProjectInfo: "/public/projects/:code",
      submitApplication: "/public/projects/:code/apply"
    },
    testing: {
      health: "/test/health",
      debugUsers: "/debug/users",
      testEmail: "/test/email",
      stats: "/test/stats"
    }
  }
};

export default configs;