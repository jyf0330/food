<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("Food app launch");
});
onShow(() => {
  console.log("Food app show");
});
onHide(() => {
  console.log("Food app hide");
});
</script>
<style>
page {
  min-height: 100%;
  background: #fffaf3;
  color: #1f2933;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
scroll-view {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  line-height: normal;
}

button::after {
  border: 0;
}
</style>
