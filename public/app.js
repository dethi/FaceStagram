const imgPerLine = Math.floor(window.innerWidth / 200);
const rowPerView = Math.floor(window.innerHeight / 200) + 2;
const itemPerPage = imgPerLine * rowPerView;

let isFetching = false;
let isEnd = false;
let lastId = undefined;

window.onscroll = () => {
  const p =
    window.scrollY + 1.5 * window.innerHeight >= document.body.scrollHeight;
  if (p) {
    fetchPictures(lastId, itemPerPage);
  }
};

const fetchPictures = (cursor, itemPerPage) => {
  if (isFetching || isEnd) {
    return;
  }
  isFetching = true;

  const searchParams = new URLSearchParams();
  searchParams.append('itemPerPage', itemPerPage);
  if (cursor !== undefined) {
    searchParams.append('lastId', cursor);
  }

  return fetch(`/api/pictures?${searchParams.toString()}`)
    .then(res => res.json())
    .then(arr => {
      if (arr.length === 0) {
        isEnd = true;
        return;
      }

      const $gallery = document.getElementById('gallery');
      const $fragment = new DocumentFragment();
      arr.forEach(e => {
        const $figure = document.createElement('figure');
        const $img = document.createElement('img');
        $img.setAttribute('src', e.picture);
        $figure.appendChild($img);
        $fragment.appendChild($figure);
      });
      $gallery.appendChild($fragment);

      const last = arr.pop();
      return last === undefined ? undefined : last.id;
    })
    .then(id => {
      lastId = id;
      isFetching = false;
    })
    .catch(err => {
      console.log(err);
    });
};

fetchPictures(lastId, itemPerPage);
