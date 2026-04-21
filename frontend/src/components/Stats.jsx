export default function Stats() {
  const statsData = [
    {
      title: "Títulos",
      value: 5,
      icon: "📚",
    },
    {
      title: "Exemplares",
      value: 17,
      icon: "📦",
    },
    {
      title: "Leitores",
      value: 3,
      icon: "👤",
    },
    {
      title: "Em empréstimo",
      value: 1,
      icon: "📄",
    },
    {
      title: "Reservas",
      value: 1,
      icon: "📌",
    },
    {
      title: "Multas",
      value: 0,
      icon: "⚠️",
    },
  ];

  return (
    <div className="stats">
      {statsData.map((item, index) => (
        <div key={index} className="card">
          
          <div className="icon">
            {item.icon}
          </div>

          <h2 className="value">
            {item.value}
          </h2>

          <p className="label">
            {item.title}
          </p>

        </div>
      ))}
    </div>
  );
}