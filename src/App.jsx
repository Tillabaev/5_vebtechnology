import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://inai-col1.fishrungames.com";

function AdForm({ onSent }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [fileKey, setFileKey] = useState(0); // для сброса поля файла
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Отправка объявления (POST, multipart/form-data)
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);
    // Content-Type вручную НЕ указываем — браузер сам добавит boundary

    setSending(true);
    setMessage({ text: "Отправка...", type: "" });

    try {
      const response = await fetch(`${API_URL}/ads`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      await response.json();

      setMessage({ text: "Объявление отправлено!", type: "success" });
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
      setFileKey((k) => k + 1);
      onSent();
    } catch (error) {
      setMessage({
        text: `Не удалось отправить: ${error.message}`,
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card">
      <h2>Подать объявление</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Заголовок
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="Например: Ноутбук"
          />
        </label>

        <label>
          Описание
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Расскажите о товаре"
          />
        </label>

        <label>
          Цена
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            placeholder="30000"
          />
        </label>

        <label>
          Изображение
          <input
            key={fileKey}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </label>

        <button type="submit" disabled={sending}>
          Отправить
        </button>
        <p className={`message ${message.type}`}>{message.text}</p>
      </form>
    </section>
  );
}

function AdCard({ ad }) {
  return (
    <article className="ad">
      {ad.image_url ? (
        <img src={API_URL + ad.image_url} alt={ad.title} />
      ) : (
        <div className="no-image">Нет фото</div>
      )}
      <div className="ad-body">
        <h3 className="ad-title">{ad.title}</h3>
        <p className="ad-description">{ad.description}</p>
        <p className="ad-price">
          {Number(ad.price).toLocaleString("ru-RU")} сом
        </p>
      </div>
    </article>
  );
}

function AdList({ ads, loading, error, onRefresh }) {
  return (
    <section>
      <div className="list-header">
        <h2>Объявления</h2>
        <button className="secondary" onClick={onRefresh}>
          Обновить
        </button>
      </div>

      {loading && <p className="message">Загрузка...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && ads.length === 0 && (
        <p className="message">Объявлений пока нет</p>
      )}

      <div className="ads-list">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Получение списка объявлений (GET)
  async function loadAds() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/ads`);
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      const data = await response.json();
      setAds(data.items.slice().reverse()); // новые сверху
    } catch (err) {
      setError(`Не удалось загрузить объявления: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  return (
    <>
      <header className="header">
        <h1>Доска объявлений</h1>
      </header>
      <main className="container">
        <AdForm onSent={loadAds} />
        <AdList
          ads={ads}
          loading={loading}
          error={error}
          onRefresh={loadAds}
        />
      </main>
    </>
  );
}
