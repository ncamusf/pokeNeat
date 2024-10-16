import * as admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id,
});

const db = admin.firestore();

export { admin, db };