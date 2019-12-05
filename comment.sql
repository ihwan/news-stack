CREATE TABLE `news_stack`.`comment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `desc` TEXT NOT NULL,
  `author` VARCHAR(45) NOT NULL,
  `inserted` DATETIME NOT NULL,
  PRIMARY KEY (`id`));