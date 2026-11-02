// Fills an empty database with a small, believable sample. Run: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import { Contact } from '../src/models/Contact';
import { Lead } from '../src/models/Lead';
import { Activity } from '../src/models/Activity';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('Set MONGO_URI in server/.env first (see .env.example).');
    process.exit(1);
}

const daysFromNow = (n: number) => new Date(Date.now() + n * 864e5);

async function seed() {
    await mongoose.connect(MONGO_URI!);

    if (await Contact.estimatedDocumentCount()) {
        console.log('Database already has contacts, leaving it alone.');
        return;
    }

    const [noa, daniel, yael] = await Contact.create([
        { firstName: 'Noa', lastName: 'Ben-David', companyName: 'Kesem Logistics', email: 'noa@kesemlog.co.il', phone: '+972 52 418 2290', type: 'Business' },
        { firstName: 'Daniel', lastName: 'Hart', companyName: 'Northwind Retail', email: 'd.hart@northwind.com', phone: '+44 20 7946 0321', type: 'Business' },
        { firstName: 'Yael', lastName: 'Mizrahi', companyName: 'Ofek Clinics', email: 'yael.m@ofek-clinics.co.il', phone: '+972 54 771 0034', type: 'Business' },
    ]);

    await Lead.create([
        { title: 'Fleet tracking rollout', companyName: 'Kesem Logistics', stage: 'Negotiation', estimatedValue: 48000, probability: 70, expectedCloseDate: daysFromNow(12) },
        { title: 'POS integration', companyName: 'Northwind Retail', stage: 'Negotiation', estimatedValue: 31000, probability: 60, expectedCloseDate: daysFromNow(-3) },
        { title: 'Patient portal pilot', companyName: 'Ofek Clinics', stage: 'Prospecting', estimatedValue: 22000, probability: 25, expectedCloseDate: daysFromNow(35) },
        { title: 'Clinic scheduling module', companyName: 'Ofek Clinics', stage: 'Closed Won', estimatedValue: 26000, probability: 100 },
        { title: 'Ordering app', companyName: 'Bellini Foods', stage: 'Lost', estimatedValue: 8800, probability: 0 },
    ]);

    await Activity.create([
        { type: 'Call', outcome: 'Walked through fleet pricing tiers', relatedTo: noa._id, relatedToType: 'Contact', date: daysFromNow(-0.2) },
        { type: 'Email', outcome: 'Sent revised POS integration quote', relatedTo: daniel._id, relatedToType: 'Contact', date: daysFromNow(-1) },
        { type: 'Meeting', outcome: 'Pilot scoping with clinic managers', relatedTo: yael._id, relatedToType: 'Contact', date: daysFromNow(-2) },
    ]);

    console.log('Seeded 3 contacts, 5 deals, 3 activities.');
}

seed()
    .catch((err) => { console.error(err); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
