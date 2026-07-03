import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

import { LANGUAGE_CHOICES } from "@/lib/languages";

const languages = Object.entries(LANGUAGE_CHOICES);
const ACTIVE_COLOR = "blue.400";

export default function LanguageSelector({
  language,
  onSelect,
}: {
  language: string;
  onSelect: any;
}) {
  return (
    <Box ml={2} className="p-4">
      <Text mb={2} fontSize="lg">
        <span className="text-sm font-extrabold">Language:</span>
      </Text>
      <Menu isLazy>
        <MenuButton as={Button}
        ><span className="text-sm">{language.toUpperCase()}</span></MenuButton>
        <MenuList bg="#110c1b">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : ""}
              bg={lang === language ? "gray.900" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.900",
              }}
              onClick={() => onSelect(lang)}
            >
              {lang}
              &nbsp;
              <Text as="span" color="gray.600" fontSize="sm">
                ({version})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}
