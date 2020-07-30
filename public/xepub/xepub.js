const main = async () => {
  const version = await fetch("/api/version").then((res) => res.text());
  const epub = await fetch("/api/epub").then((res) => res.json());
  console.log(epub);

  console.log(`You are using Xepub ${version}`);

  const iframe = document.getElementById("iframe");

  new WebSocket("ws://localhost:8080");

  let now_page = 0;
  iframe.src = epub.spine[now_page];
  const keyevent = (e) => {
    switch (e.key) {
      case "ArrowRight":
      case "d":
      case "l":
        if (now_page < epub.spine.length - 1) {
          iframe.src = epub.spine[++now_page];
        }
        break;
      case "ArrowLeft":
      case "a":
      case "h":
        if (now_page > 0) {
          iframe.src = epub.spine[--now_page];
        }
        break;
    }
  };
  iframe.addEventListener("load", () => {
    iframe.contentDocument.addEventListener("keydown", keyevent);
  });
  document.addEventListener("keydown", keyevent);
};

main();
