import { getMeditationRecords } from '@/actions/meditation'
import { RecordList } from '@/components/RecordList'

export default async function RecordsPage() {
  const records = await getMeditationRecords()
  return <RecordList records={records} />
}
