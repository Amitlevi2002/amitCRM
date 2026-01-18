
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://amitlevi:amitlevi201002@cluster0.9ngekjj.mongodb.net/?appName=Cluster0';

// Define schemas inline to avoid TS compilation dependencies
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    type: String,
    status: { type: String, default: 'New' }
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
    title: String,
    companyName: String,
    status: { type: String, default: 'New' },
    leadScore: { type: Number, default: 0 },
    source: String,
    assignedTo: mongoose.Schema.Types.ObjectId,
    stage: { type: String, default: 'Prospecting' },
    estimatedValue: { type: Number, default: 0 },
    probability: { type: Number, default: 0 },
    expectedCloseDate: Date
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
    type: String,
    description: String,
    relatedTo: mongoose.Schema.Types.ObjectId,
    createdBy: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);
const Lead = mongoose.model('Lead', leadSchema);
const Activity = mongoose.model('Activity', activitySchema);

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Create Mock ID for user
        const mockUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

        // Contacts
        console.log('Creates Contacts...');
        const contacts = await Contact.create([
            { firstName: 'Alice', lastName: 'Johnson', email: 'alice@techcorp.com', phone: '555-0101', company: 'TechCorp', type: 'Business' },
            { firstName: 'Bob', lastName: 'Smith', email: 'bob@startup.io', phone: '555-0102', company: 'StartupIO', type: 'Private' },
            { firstName: 'Charlie', lastName: 'Davis', email: 'charlie@enterprise.net', phone: '555-0103', company: 'EnterpriseNet', type: 'Business' },
            { firstName: 'David', lastName: 'Wilson', email: 'david@agency.com', phone: '555-0104', company: 'CreativeAgency', type: 'Business' }
        ]);

        // Leads
        console.log('Creates Leads...');
        const leads = await Lead.create([
            { title: 'Enterprise License Deal', companyName: 'TechCorp', status: 'Qualified', stage: 'Negotiation', estimatedValue: 25000, probability: 75, assignedTo: mockUserId },
            { title: 'Q1 Service Contract', companyName: 'StartupIO', status: 'New', stage: 'Prospecting', estimatedValue: 5000, probability: 20, assignedTo: mockUserId },
            { title: 'Legacy System Upgrade', companyName: 'EnterpriseNet', status: 'Contacted', stage: 'Closed Won', estimatedValue: 120000, probability: 100, assignedTo: mockUserId },
            { title: 'Marketing Retainer', companyName: 'CreativeAgency', status: 'New', stage: 'Prospecting', estimatedValue: 3500, probability: 10, assignedTo: mockUserId }
        ]);

        // Activities
        console.log('Creates Activities...');
        await Activity.create([
            { type: 'Call', description: 'Initial discovery call with Alice', relatedTo: contacts[0]._id, createdBy: mockUserId },
            { type: 'Meeting', description: 'Demo presentation for TechCorp', relatedTo: leads[0]._id, createdBy: mockUserId },
            { type: 'Email', description: 'Sent proposal to Bob', relatedTo: contacts[1]._id, createdBy: mockUserId },
            { type: 'Task', description: 'Follow up on contract draft', relatedTo: leads[2]._id, createdBy: mockUserId }
        ]);

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
