import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  console.log('[Firebase] Initializing...', {
    projectId,
    clientEmail,
    privateKeyLength: privateKey?.length,
  })

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    })
    console.log('[Firebase] Initialized successfully')
  } catch (err) {
    console.error('[Firebase] Init failed:', err)
    process.exit(1)
  }
}

export const firebaseAuth = admin.auth()
