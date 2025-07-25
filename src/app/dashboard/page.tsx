import CinematicNavbar from '@/components/CinematicNavbar'
import PatentCalculatorDashboard from '@/components/PatentCalculatorDashboard'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-navy-black">
      <CinematicNavbar />
      <div className="pt-20">
        <PatentCalculatorDashboard />
      </div>
    </div>
  )
} 