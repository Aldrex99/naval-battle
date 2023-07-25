export function tableHeader(opponent = false) {
  return (
    <thead>
      <tr className={`divide-x ${opponent ? "divide-cyan-400" : "divide-orange-400"}`}>
        <th className="w-10 h-10"></th>
        <th className="w-10 h-10">A</th>
        <th className="w-10 h-10">B</th>
        <th className="w-10 h-10">C</th>
        <th className="w-10 h-10">D</th>
        <th className="w-10 h-10">E</th>
        <th className="w-10 h-10">F</th>
        <th className="w-10 h-10">G</th>
        <th className="w-10 h-10">H</th>
        <th className="w-10 h-10">I</th>
        <th className="w-10 h-10">J</th>
      </tr>
    </thead>
  )
}