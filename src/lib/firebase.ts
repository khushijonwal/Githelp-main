// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { errorUtil } from "node_modules/zod/lib/helpers/errorUtil";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCweGh1f_KG2nxuAp3Ms2-1M9aZ61Szrj0",
  authDomain: "githelp-eb4c9.firebaseapp.com",
  projectId: "githelp-eb4c9",
  storageBucket: "githelp-eb4c9.firebasestorage.app",
  messagingSenderId: "494976455648",
  appId: "1:494976455648:web:bb2e32983cd7f87d8a5185"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file:File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if(setProgress) setProgress(progress)
                    switch(snapshot.state) {
                case 'paused': 
                    console.log('upload is paused'); break;
                case 'running':
                    console.log('upload is running'); break;
                }
            }, error => {
                reject(error)
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                    resolve(downloadUrl as string)
                })
            })
        }
        catch(error) {
            console.error(error)
            reject(error)
        }
    })
    
}