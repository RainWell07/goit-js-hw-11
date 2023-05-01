// FETCH
import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const API_KEY = "35883602-c1dbd6afe8bcf07d5100778d4";
const BASE_URL = "https://pixabay.com/api/";

const fetchImages = async (query, page, perPage = 40) => {
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  try {
    const response = await axios.get(url);
    if (response.data.hits.length > 0) {
    return response.data.hits.map((hit) => ({
    webformatURL: hit.webformatURL,
    largeImageURL: hit.largeImageURL,
    tags: hit.tags,
    likes: hit.likes,
    views: hit.views,
    comments: hit.comments,
    downloads: hit.downloads,
      }));} 
      
  else {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    return [];
    }}
  catch (error) {
  console.log(error);
  }
};
// 

// РОЗМІТКА 
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
const perPage = 40;
let currentQuery = '';
let isLoading = false;

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionDelay: 250,
});


const createImageCard = (image) => {
  const card = document.createElement('div');
  const imageEl = document.createElement('img');
  const imageLink = document.createElement('a');
  card.classList.add('card');
  imageEl.src = image.webformatURL;
  imageEl.alt = image.tags;
  imageEl.loading = 'lazy';
  imageEl.classList.add('js-card-img');
  imageLink.href = image.largeImageURL;
  
  imageEl.addEventListener('click', () => {
  lightbox.open(imageLink);
});

  const stats = document.createElement('div');
  stats.classList.add('js-cards');

  const likes = document.createElement('p');
  likes.classList.add('js-card-description');
  likes.innerHTML = `<span class="js-style">Likes:</span>${image.likes}`;

  const views = document.createElement('p');
  views.classList.add('js-statistic');
  views.innerHTML = `<span class="js-style">Views:</span>${image.views}`;

  const comments = document.createElement('p');
  comments.classList.add('js-statistic');
  comments.innerHTML = `<span class="js-style">Comments:</span>${image.comments}`;

  const downloads = document.createElement('p');
  downloads.classList.add('js-statistic');
  downloads.innerHTML = `<span class="js-style">Downloads:</span>${image.downloads}`;
  
  imageLink.appendChild(imageEl);
  card.appendChild(imageLink);
  stats.append(likes, views, comments, downloads);
  card.append(imageEl, stats);

  return card;
};


const renderImageCards = (images) => {
  const cards = images.map((image) => createImageCard(image));
  gallery.append(...cards);
  lightbox.refresh()
};


const loadMoreImages = async () => {
  if (isLoading) {
    return;
  }
  isLoading = true;
  try {
    page += 1;
    const images = await fetchImages(currentQuery, page, perPage);
    if (images.length > 0) {
    renderImageCards(images);
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoading = false;
  }
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
};

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  const input = event.currentTarget.elements.searchQuery;
  currentQuery = input.value.trim();
  if (currentQuery === '') {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }
  const images = await fetchImages(currentQuery, page, perPage);
  if (images.length > 0) {
    renderImageCards(images);
  }
});

window.addEventListener('scroll', () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 1 && !isLoading) {
    loadMoreImages();
  }
});

