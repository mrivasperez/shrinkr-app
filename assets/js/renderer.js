const path = require("path"),
  os = require("os"),
  { ipcRenderer } = require("electron"),
  form = document.getElementById("image-form"),
  slider = document.getElementById("slider"),
  img = document.getElementById("img");

document.getElementById("output-path").innerText = path.join(
  os.homedir(),
  "shrinkr"
);

// on submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const quality = slider.value;

  ipcRenderer.send("image:minimize", {
    imgPath,
    quality,
  });
});

// on done
ipcRenderer.on("image:done", (done) => {
  M.toast({
    html: `Image compressed to ${slider.value}% of original size.`,
  });
});
