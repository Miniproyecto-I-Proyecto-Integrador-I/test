import { useParams } from 'react-router-dom'

const ActivityPage = () => {
	const { id } = useParams<{ id: string }>()

	return (
		<div>
			<h1>Activity Page</h1>
			<p>El id de la actividad es: {id}</p>
		</div>
	)
}

export default ActivityPage
