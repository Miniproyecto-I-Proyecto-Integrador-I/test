import { useStatusCard } from "../Hooks/useStatusCard"
import  StatusCard  from './StatusCard'

const StatusCardGrid: React.FC = () => {

  const {
    defeatedSubTask,
    todaySubTask,
    nextSubTask,
    loading } = useStatusCard()

  if (loading) {
    return (
      <div className="today-loading-state">
        <div className="spinner"></div>
        <p>Cargando cards</p>
      </div>
    );
  }

  
 
  console.log("Data de statusCard:", defeatedSubTask)

  return (
    <div>

      <StatusCard subtask={defeatedSubTask}
        message={"Mas antigua"} />

      <StatusCard subtask={todaySubTask}
        message={"Hoy"} />

      <StatusCard subtask={nextSubTask}
        message={"Por venir"} />

    </div>
  )
}

export default StatusCardGrid