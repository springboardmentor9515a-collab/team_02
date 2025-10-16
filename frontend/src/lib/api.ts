// This file acts as a fake API for fetching data.
// In a real application, these functions would make network requests to a server.

const mockPetitions = [
    {
      id: '1',
      title: "Improve Public Transportation in Downtown",
      summary: "Requesting more frequent bus routes and better maintenance of transit stops.",
      category: "Transportation",
      location: "Downtown District",
      signatures: 1247,
      goal: 2000,
      daysLeft: 15,
      status: "active",
    },
    {
      id: '2',
      title: "Install Solar Panels in Public Schools",
      summary: "Initiative to make our schools more sustainable and reduce energy costs.",
      category: "Environment",
      location: "Citywide",
      signatures: 2891,
      goal: 3000,
      daysLeft: 8,
      status: "trending",
    },
];

const mockPolls = [
    {
      id: '1',
      question: "What should be the priority for next year's city budget?",
      description: "Help us decide where to allocate the majority of next year's municipal budget.",
      category: "Budget",
      options: [
        { id: 'a', text: "Infrastructure", votes: 342, percentage: 38 },
        { id: 'b', text: "Education", votes: 298, percentage: 33 },
        { id: 'c', text: "Healthcare", votes: 187, percentage: 21 },
        { id: 'd', text: "Environment", votes: 73, percentage: 8 }
      ],
      totalVotes: 900,
      endsIn: "3 days",
      status: "active",
    },
    {
      id: '2',
      question: "Should the city implement a bike-sharing program?",
      description: "We're considering launching a bike-sharing program to provide eco-friendly transportation options.",
      category: "Transportation",
      options: [
        { id: 'a', text: "Yes, citywide", votes: 456, percentage: 52 },
        { id: 'b', text: "Yes, but pilot first", votes: 298, percentage: 34 },
        { id: 'c', text: "No", votes: 123, percentage: 14 }
      ],
      totalVotes: 877,
      endsIn: "1 week",
      status: "trending",
    },
];

const mockReports = [
    {
      id: '1',
      title: "Broken Streetlight on Main Street",
      description: "The streetlight at the intersection of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians and drivers.",
      category: "Infrastructure",
      tags: ["Street Maintenance"],
      location: "Main St & Oak Ave",
      status: "In Progress",
      upvotes: 23,
      submittedBy: "Anonymous",
      attachments: 1
    },
    {
      id: '2',
      title: "Pothole on Elm Street",
      description: "Large pothole near 123 Elm Street is causing damage to vehicles and creating a traffic hazard.",
      category: "Infrastructure",
      tags: ["Road Maintenance"],
      location: "123 Elm Street",
      status: "Resolved",
      upvotes: 45,
      submittedBy: "Sarah Johnson",
      attachments: 2
    },
];

// --- PETITIONS API ---
export const getPetitions = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPetitions);
    }, 800); // Simulate network latency
  });
};

// --- POLLS API ---
export const getPolls = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPolls);
    }, 700); // Simulate network latency
  });
};

// --- REPORTS API ---
export const getReports = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReports);
    }, 600); // Simulate network latency
  });
};

