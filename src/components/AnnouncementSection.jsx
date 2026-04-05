import AnnouncementCard from "./AnnouncementCard";

function AnnouncementSection({ title, events }) {
  return (
    <section className="announcement-section">
      <h2 className="announcement-section__title">{title}</h2>

      {events.length === 0 ? (
        <p className="announcement-section__empty">No events to show.</p>
      ) : (
        <div className="announcement-grid">
          {events.map((event) => (
            <AnnouncementCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export default AnnouncementSection;