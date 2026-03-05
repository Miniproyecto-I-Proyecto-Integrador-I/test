import type {Subtask} from '../Types/models'
import '../Styles/StatusCardStyles.css'

interface StatusCard{
    subtask?: Subtask
    message : String
}

const StatusCard: React.FC<StatusCard> = ({
    subtask,
    message
}) => {
   if (!subtask) {
    return <div className="empty-card">{message}: No data</div>;
  }

  return (
    <div className='statusCard'>
        <p>{message}</p>
        <p>{subtask.description}</p>
        <p>{subtask.planification_date}</p>
    </div>
  )
}

export default StatusCard