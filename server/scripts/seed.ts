
import mongoose from 'mongoose';
import { Contact } from '../src/models/Contact';
import { Lead } from '../src/models/Lead';
import { Activity } from '../src/models/Activity';

const MONGO_URI = 'mongodb+srv://amitlevi:amitlevi201002@cluster0.9ngekjj.mongodb.net/?appName=Cluster0';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional, maybe unsafe if user has real data, better just add)
        // awaiting clear for now to ensure clean state for "examples"
        // await Contact.deleteMany({});
        // await Lead.deleteMany({});
        // await Activity.deleteMany({});

        // Contacts
        const contacts = await Contact.create([
            { firstName: 'Alice', lastName: 'Johnson', email: 'alice@techcorp.com', phone: '555-0101', company: 'TechCorp', type: 'Business' },
            { firstName: 'Bob', lastName: 'Smith', email: 'bob@startup.io', phone: '555-0102', company: 'StartupIO', type: 'Private' },
            { firstName: 'Charlie', lastName: 'Davis', email: 'charlie@enterprise.net', phone: '555-0103', company: 'EnterpriseNet', type: 'Business' }
        ]);
        console.log(`Created ${contacts.length} contacts`);

        // Leads/Deals
        const leads = await Lead.create([
            { title: 'Enterprise License Deal', companyName: 'TechCorp', status: 'Qualified', stage: 'Negotiation', estimatedValue: 25000, probability: 75, assignedTo: new mongoose.Types.ObjectId() },
            { title: 'Q1 Service Contract', companyName: 'StartupIO', status: 'New', stage: 'Prospecting', estimatedValue: 5000, probability: 20, assignedTo: new mongoose.Types.ObjectId() },
            { title: 'Legacy System Upgrade', companyName: 'EnterpriseNet', status: 'Contacted', stage: 'Closed Won', estimatedValue: 120000, probability: 100, assignedTo: new mongoose.Types.ObjectId() }
        ]);
        console.log(`Created ${leads.length} leads`);

        // Activities
        await Activity.create([
            { type: 'Call', description: 'Initial discovery call with Alice', relatedTo: contacts[0]._id, createdBy: new mongoose.Types.ObjectId(), date: new Date() },
            { type: 'Meeting', description: 'Demo presentation for TechCorp', relatedTo: leads[0]._id, createdBy: new mongoose.Types.ObjectId(), date: new Date() },
            { type: 'Email', description: 'Sent proposal to Bob', relatedTo: contacts[1]._id, createdBy: new mongoose.Types.ObjectId(), date: new Date() }
        ]);
        console.log('Created activities');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
