import { db } from './../firebase'
import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore"
import { DEV_MODE } from './_InitSetting'
import { initState } from './DataInit'

const COLLECTION = "test_coup"
export const EMOJI_DOC = "bYDT3wsIXzjxHauo5QrZ"

export const fetchInitData = async ({ roomId }) => {
	return getDocs(collection(db, COLLECTION))
		.then((querySnapshot) => {
			const newData = querySnapshot.docs
				.map((doc) => ({ ...doc.data(), id: doc.id }))
 
			return newData.find(data => data.id === roomId)
		})
}

export const updateData = async (data = {}, { roomId }) => {
	try {
		const update = {
			...data
		}

		console.log("BEFORE UPDATE ", update)
		if (!DEV_MODE) updateDoc(doc(collection(db, COLLECTION), roomId), { ...update })
		console.log('Document successfully updated!');
	} catch (error) {
		console.error('Error updating document: ', error);
	}
};

export const subscribeData = async (callback, { roomId }) => {
  onSnapshot(doc(collection(db, COLLECTION), roomId), (snapshot) => {
    console.log({ snapshot })
    console.log(snapshot.data())
    const data = snapshot.data()

    callback(data)
  })
}

export const addInit = async () => {
  try {
    const jsonData = JSON.parse(JSON.stringify(initState))
    console.log('addInit', jsonData)

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...jsonData
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const resetInit = async (roomId, sessionId) => {
  try {
    const _initState = { ...initState, rule: { ...initState.rule, turnSessionId: sessionId } }

    const jsonData = JSON.parse(JSON.stringify(_initState))
    console.log("before reset ", jsonData)

    await updateDoc(doc(collection(db, COLLECTION), roomId), { ...jsonData })

    console.log('Document successfully updated!');
  } catch (error) {
    console.error('Error updating document: ', error);
  }
}


export const subscribeEmojiData = async (callback) => {
  onSnapshot(doc(collection(db, COLLECTION), EMOJI_DOC), (snapshot) => {
    console.log({ snapshot })
    console.log(snapshot.data())
    const data = snapshot.data()

    callback(data)
  })
}
