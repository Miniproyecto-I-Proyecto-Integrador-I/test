import { useParams } from 'react-router-dom'

const ActivityPage = () => {
	const { id } = useParams<{ id: string }>()

	return (
		<section className="page">
			<h2>Activity Page</h2>
			<p>El id de la actividad es: {id}</p>
		</section>
	)
}
export default ActivityPage
