# Instructions
1. npm install
2. npm run build
3. Run "node build/index" or "node build/cart" to run the script from the build folder

* When I wanted to scrap product details it was opened in the new page, so I was wandering why I can'y access any element, until I realized it's a NEW PAGE :)
  So, I solved the problem by taking the product link and creating a new puppeteer page for every product.

* I spand some time trying to dynamicaly handle multiple select fields before adding product to the cart. I eventually looped through select fields dynamicaly and
  taking the value of the second value from the option field, and then set that value to the select field. After that I couldn't make it work for some time, because,
  as I realized later, when one select field is selected it looks like that other fields and the button are temporary disabled and the code runs to fast and only the first field is handled properly,
  so I created timeout function in the loop to handle fields one by one.

* Minor problems with the shipping form, cause there are some invisible inputs with the same classes, so fields should be selected properly.

* At the end I tried to solve the puzzle captcha, but unfortunately I didnt make it completely. First I had a problem to check is the captcha there or not,
  and after some time I learned that I have to grab iframe element first and then to read it's content. So now I can know is there a captcha or not.
  After that I tried to use Rembrantd.js to compare images and move the slider in the right position, and it looks like I'm close to solve that problem,
  but for now I just commented that part of the code.

* I've read that some timeout functions can prevent to be detected, so I put timeout when open the page. Also, preventing unnecessary request can improve performance maybe,
  so I created one simple function to block request for videos.

* Also, this is not my best, I could do much better when it comes to code splitting, typescript, error handling, etc...but I didn't have time to do everything I wanted before the meeting.

* I enjoyed working on this task and I would like to learn much more :)
