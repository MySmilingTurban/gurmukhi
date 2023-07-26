import { Timestamp } from 'firebase/firestore';
import { NewSentenceType, NewWordType, QuestionType, Option, TimestampType } from '../../types';
import { createMultipleValsAtOnce } from './controller';

export const seperateIdsAndNewWords = (some: any) => {
    const uniqueList = [] as any[];
    const idList = [] as string[]
    for (const item of some) {
      const duplicate = uniqueList.find(
        (obj) => obj.word === item.word
      );
      if (!duplicate) {
        if (Object.keys(item).includes('id') && item.id) {
          idList.push(item.id)
        } else {
          uniqueList.push(item)
        }
      }
    }
    return [uniqueList, idList]
}

export const seperateIdsAndNewSentences = (some: any) => {
    const uniqueList = [] as any[];
    const idList = [] as string[]
    for (const item of some) {
      const duplicate = uniqueList.find(
        (obj) => obj.sentence === item.sentence
      );
      if (!duplicate) {
        if (Object.keys(item).includes('id') && item.id) {
          idList.push(item.id)
        } else {
          uniqueList.push({
            sentence: item.sentence,
            translation: item.translation
          })
        }
      }
    }
    return [uniqueList, idList]
}

export const createSupportWords = async (wordList: NewWordType[], user: any) => {
    const w = wordList.map((ele) => {
        return {
            word: ele.word,
            translation: ele.translation,
            is_for_support: true,
            created_by: user.email,
            created_at: Timestamp.now(),
            updated_by: user.email,
            updated_at: Timestamp.now()
        }
    })
    return createMultipleValsAtOnce(w, 'words')
}

export const createSupportSentences = async (sentList: NewSentenceType[], user: any) => {
    const s = sentList.map((item) => {
        return {
            sentence: item.sentence,
            translation: item.translation,
            created_by: user.email,
            created_at: Timestamp.now(),
            updated_by: user.email,
            updated_at: Timestamp.now()
        }
    })
    return createMultipleValsAtOnce(s, 'sentences')
}

export const setOptionsDataForSubmit = (questionsData: QuestionType[]) => {
  const newQuestions = questionsData.map((ele) => {
    const lOptions = (ele.options as Option[]).map((opt) => {
      if (Object.keys(opt).includes('id')) {
        return opt.id
      } else {
        return opt
      }
    })
    return {
      ...ele,
      options: lOptions
    }
  });
  return newQuestions
}

export function convertTimestampToDateString(timestamp: TimestampType) {
    if (!timestamp) return 'Invalid time'
    const timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return timestampDate.toLocaleString('en-us', { year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'});
}

export function convertTimestampToDate(timestamp: TimestampType) {
    if (!timestamp) return 'Invalid time'
    const timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    return timestampDate
}
