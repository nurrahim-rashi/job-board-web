const stars = Array.from({ length: 70 }, (_, index) => ({
  left: `${((((index * 9301 + 49297) % 233280) / 233280) * 100).toFixed(2)}%`,
  top: `${((((index * 4721 + 7919) % 10007) / 10007) * 100).toFixed(2)}%`,
  size: index % 5 === 0 ? 2.5 : 1.5,
  delay: `${(index % 11) * 0.42}s`,
}));
export function Stars() {
  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star, index) => (
        <i
          key={index}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
