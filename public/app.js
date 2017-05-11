///////////
// Add Form
///////////

const $form = document.getElementById('add-image');
const $imageUrl = document.getElementById('image-url');

$form.onsubmit = e => {
  e.preventDefault();

  const url = $imageUrl.value;
  $imageUrl.value = '';

  if (url !== '') {
    fetch('/api/pictures', {
      method: 'POST',
      body: JSON.stringify({ picture: url }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  return false;
};

////////
// Modal
////////

const $modal = document.getElementById('modal');
const $modalImg = document.getElementById('modal-img');
const $modalClose = document.getElementById('modal-close');
const $modalDelete = document.getElementById('modal-delete');

// Close modal
$modalClose.onclick = () => {
  $modal.style.display = 'none';
};

// Close modal
window.onkeydown = evt => {
  const e = evt || window.event;
  if (e.keyCode == 27) {
    $modalClose.click();
  }
};

/////////////////
// Infinit scroll
/////////////////

const imgPerLine = Math.floor(window.innerWidth / 200);
const rowPerView = Math.floor(window.innerHeight / 200) + 2;
const amount = imgPerLine * rowPerView;

let isFetching = false;
let isEnd = false;
let nextCursor = undefined;

const fetchPictures = (cursor, amount) => {
  if (isFetching || isEnd) {
    return;
  }
  isFetching = true;

  const searchParams = new URLSearchParams();
  searchParams.append('amount', amount);
  if (cursor !== undefined) {
    searchParams.append('cursor', cursor);
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
      arr.forEach(img => {
        const $figure = document.createElement('figure');
        const $img = document.createElement('img');
        $img.setAttribute('src', img.picture);
        $img.setAttribute('data-id', img.id);
        $img.onclick = () => {
          $modal.style.display = 'block';
          $modalImg.src = $img.src;

          $modalDelete.onclick = e => {
            e.preventDefault();
            fetch(`/api/pictures/${img.id}`, { method: 'DELETE' });
            $img.remove();
            $modalClose.click();
          };
        };

        $figure.appendChild($img);
        $fragment.appendChild($figure);
      });
      $gallery.appendChild($fragment);

      const last = arr.pop();
      return last === undefined ? undefined : last.id;
    })
    .then(id => {
      nextCursor = id;
      isFetching = false;
    })
    .catch(err => {
      console.log(err);
    });
};

// Scroll event
window.onscroll = () => {
  const scrollPos = window.pageYOffset;
  const pageHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (pageHeight - (scrollPos + clientHeight) < 50) {
    fetchPictures(nextCursor, amount);
  }
};

fetchPictures(nextCursor, amount);
