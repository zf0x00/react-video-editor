import { EDIT_OBJECT, dispatcher, useEditorState } from "@designcombo/core";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HexColorPicker } from "react-colorful";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  ALargeSmall,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronsUpDown,
  Italic,
  Underline,
  UnfoldVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { set, transform, upperCase } from "lodash";
import { Toggle } from "../ui/toggle";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface ITextProps {
  backgroundColor: string;
  border: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fontWeight: string;
  height: number;
  letterSpacing: string;
  lineHeight: string;
  opacity: number;
  text: string;
  textAlign: string;
  textDecoration: string;
  textShadow: string;
  width: number;
  wordSpacing: string;
  transform: string;
}

const defaultProps = {
  backgroundColor: "transparent",
  border: "none",
  color: "#ffffff",
  fontFamily: "Roboto-Bold",
  fontSize: 64,
  fontStyle: "normal",
  fontWeight: "normal",
  height: 400,
  letterSpacing: "normal",
  lineHeight: "normal",
  opacity: 100,
  text: "Heading",
  textAlign: "left",
  textDecoration: "none",
  textShadow: "none",
  width: 500,
  wordSpacing: "normal",
  transform: "scale(1) rotate(0deg) translateX(0) translateY(0)",
};

const stringContent = [
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "textAlign",
  "text",
  "backgroundColor",
  "color",
  "textShadow",
  "strokeColor",
  "textDecoration",
];

const extractNumbersToTransform = (
  transformString: string
): {
  scale?: number;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotate?: number;
} => {
  const regex = /(scale|translateX|translateY|translateZ|rotate)\(([^)]+)\)/g;
  let match;
  const transformations = {};
  const replaceUnits = (value) => {
    if (value.endsWith("deg")) {
      return value.replace("deg", "");
    } else if (value.endsWith("px")) {
      return value.replace("px", "");
    }
    return value;
  };
  while ((match = regex.exec(transformString)) !== null) {
    const transformType = match[1];
    const transformValue = match[2];
    if (transformType === "rotate") {
      transformations[transformType] = transformValue.replace("deg", "");
    } else {
      transformations[transformType] = transformValue;
    }
  }
  return transformations;
};

const updateTransform = (
  transformString: string,
  transformationType: string,
  newValue: string | number
) => {
  const regex = new RegExp(`(${transformationType}\\([^\\)]+\\))`, "g");
  if (transformationType === "rotate") {
    return transformString.replace(
      regex,
      `${transformationType}(${newValue}deg)`
    );
  }
  return transformString.replace(regex, `${transformationType}(${newValue})`);
};

const TextProps = () => {
  const { activeIds, trackItemsMap } = useEditorState();
  const [scalePrev, setScalePrev] = useState<number | "">(100);
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(true);
  const [props, setProps] = useState<ITextProps>(defaultProps);
  const [openFontFamily, setOpenFontFamily] = useState(false);
  const [openTextAlign, setOpenTextAlign] = useState(false);
  const [openTextDistance, setOpenTextDistance] = useState(false);
  const [openFontCase, setOpenFontCase] = useState(false);
  const [strokeColor, setStrokeColor] = useState("rgba(255,255,255,1)");
  const [openStrokeColor, setOpenStrokeColor] = useState(false);
  const [openTextColor, setOpenTextColor] = useState(false);
  const [openBackgroundColor, setOpenBackgroundColor] = useState(false);
  const [shadowColor, setShadowColor] = useState("rgba(255,255,255,1)");
  const [openShadowColor, setOpenShadowColor] = useState(false);
  const [opacityPrev, setOpacityPrev] = useState<number | "">(100);
  const [rotatePrev, setRotatePrev] = useState<number | "">(0);
  const fontFamilyTypes = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
    {
      value: "Roboto-Bold",
      label: "Roboto-Bold",
    },
  ];
  const textAlignTypes = [
    { icon: <AlignLeft />, type: "left" },
    { icon: <AlignCenter />, type: "center" },
    { icon: <AlignRight />, type: "right" },
  ];
  const fontSizeTypes = [64, 72, 80, 96, 128, 144, 160, 192, 256, 288, 320];
  const fontCaseTypes = [
    "Lowercase",
    "Uppercase",
    // , "Sentence case"
  ];

  useEffect(() => {
    const [id] = activeIds;
    const trackItem = trackItemsMap[id];
    if (trackItem) {
      setProps({ ...(trackItem.details as ITextProps), ...defaultProps });
      setOpacityPrev(trackItem.details.opacity);
      trackItem.details.backgroundColor === "transparent"
        ? setIsBackgroundTransparent(true)
        : setIsBackgroundTransparent(false);
      const transform = extractNumbersToTransform(trackItem.details.transform);
      if (transform.scale) {
        setScalePrev(transform.scale * 100);
      }
      if (transform.rotate) {
        setRotatePrev(transform.rotate);
      }
    }
  }, [activeIds]);

  const handleChange = useCallback(
    (type: string, e: string | number) => {
      if (!stringContent.includes(type)) {
        e = Number(e);
      }
      if (type === "opacity") {
        setOpacityPrev(Number(e));
      }
      if (type === "textShadow" && typeof e === "string") {
        setShadowColor(e);
        e = "20px 20px 40px " + e;
      }
      if (type === "transformScale") {
        setScalePrev(Number(e));
        type = "transform";
        e = updateTransform(props.transform, "scale", Number(e) / 100);
      }
      if (type === "transformRotate") {
        setRotatePrev(Number(e));
        type = "transform";
        e = updateTransform(props.transform, "rotate", Number(e));
      }
      dispatcher.dispatch(EDIT_OBJECT, {
        payload: {
          details: {
            [type]: e,
          },
        },
      });
      setProps({ ...props, [e]: e });
    },
    [props]
  );

  const validateString = useCallback((type: string, e: string) => {
    const regex = /^[0-9 ]*$/;
    if (regex.test(e)) {
      type === "opacity"
        ? setOpacityPrev(e === "" ? "" : Number(e))
        : type === "scale"
        ? setScalePrev(e === "" ? "" : Number(e))
        : setRotatePrev(e === "" ? "" : Number(e));
    }
  }, []);

  return (
    <div className="flex flex-col overflor-auto">
      <div className="text-md text-[#e4e4e7] font-medium h-11 border-b  border-border flex items-center px-4 text-muted-foreground">
        Properties
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Textarea
          placeholder="Type your message here."
          defaultValue={props?.text}
          onBlur={(e) => handleChange("text", e.target.value)}
        />
        <div className="flex gap-2">
          <Popover open={openFontFamily} onOpenChange={setOpenFontFamily}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFontFamily}
                className="w-[200px] justify-between"
              >
                {props?.fontFamily
                  ? fontFamilyTypes.find(
                      (framework) => framework.value === props?.fontFamily
                    )?.label
                  : "Select framework..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              style={{ zIndex: 300 }}
              className="flex w-[200px] p-0"
            >
              <Command>
                <CommandGroup>
                  <CommandList>
                    {fontFamilyTypes.map((fontFamilyType) => (
                      <CommandItem
                        key={fontFamilyType.value}
                        defaultValue={props?.fontFamily}
                        value={fontFamilyType.value}
                        onSelect={(currentValue) => {
                          setProps({ ...props, fontFamily: currentValue });
                          setOpenFontFamily(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            props?.fontFamily === fontFamilyType.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {fontFamilyType.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Select onValueChange={(e) => handleChange("fontSize", e)}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={props.fontSize} />
            </SelectTrigger>
            <SelectContent
              style={{ zIndex: 300 }}
              className="flex w-[80px] p-0"
            >
              <SelectGroup>
                {fontSizeTypes.map((fontSize, i) => (
                  <SelectItem key={i} value={String(fontSize)}>
                    {fontSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-6">
          <Toggle
            onClick={() => handleChange("fontWeight", "bold")}
            size="sm"
            className="w-[45px]"
            variant="outline"
          >
            <Bold />
          </Toggle>
          <Toggle size="sm" className="w-[45px]" variant="outline">
            <Italic />
          </Toggle>
          <Toggle
            pressed={props?.textDecoration === "underline" ? true : false}
            onClick={() => handleChange("textDecoration", "underline")}
            size="sm"
            className="w-[45px]"
            variant="outline"
          >
            <Underline />
          </Toggle>
          <Popover open={openTextAlign} onOpenChange={setOpenTextAlign}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                role="combobox"
                aria-expanded={openTextAlign}
                className="w-[45px] justify-between"
              >
                {props?.textAlign
                  ? textAlignTypes.find(
                      (textAlign) => textAlign.type === props?.textAlign
                    ).icon
                  : "Select Text Align..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent style={{ zIndex: 300 }} className="flex w-auto p-0">
              {textAlignTypes.map((textAlign, i) => (
                <Toggle
                  onClick={() => handleChange("textAlign", textAlign.type)}
                  pressed={props?.textAlign === textAlign.type ? true : false}
                  key={i}
                >
                  {textAlign.icon}
                </Toggle>
              ))}
            </PopoverContent>
          </Popover>
          <Popover open={openFontCase} onOpenChange={setOpenFontCase}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                role="combobox"
                aria-expanded={openFontCase}
                className="w-[45px] justify-between"
              >
                <ALargeSmall />
              </Button>
            </PopoverTrigger>
            <PopoverContent style={{ zIndex: 300 }} className="flex w-auto p-0">
              <div className="flex flex-col">
                {fontCaseTypes.map((fontCase, i) => (
                  <Button
                    onClick={() =>
                      fontCase === "Lowercase"
                        ? handleChange("text", props?.text.toLowerCase())
                        : handleChange("text", props?.text.toUpperCase())
                    }
                    variant="ghost"
                    key={i}
                  >
                    {fontCase}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Popover open={openTextDistance} onOpenChange={setOpenTextDistance}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                size="sm"
                aria-expanded={openTextDistance}
                className="w-[45px] justify-between"
              >
                <UnfoldVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent style={{ zIndex: 300 }} className="flex w-auto p-0">
              <div className="flex flex-col">
                {fontCaseTypes.map((fontCase, i) => (
                  <Button variant="ghost" key={i}>
                    {fontCase}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-2 items-center">
          <div className="text-md text-[#e4e4e7] font-medium flex items-center text-muted-foreground">
            Text Color
          </div>
          <div className="flex justify-center">
            <Popover open={openTextColor} onOpenChange={setOpenTextColor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTextColor}
                  style={{ backgroundColor: props?.color }}
                  className="w-[40px] justify-between"
                />
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 300 }}
                className="flex w-auto p-3"
              >
                <HexColorPicker
                  color={props?.color}
                  onChange={(e) => handleChange("color", e)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center">
          <div className="text-md text-[#e4e4e7] font-medium flex items-center text-muted-foreground">
            Stroke Color
          </div>
          <div className="flex justify-center">
            <Popover open={openStrokeColor} onOpenChange={setOpenStrokeColor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStrokeColor}
                  style={{ backgroundColor: strokeColor }}
                  className="w-[40px] justify-between"
                />
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 300 }}
                className="flex w-auto p-3"
              >
                <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center">
          <div className="text-md text-[#e4e4e7] font-medium flex items-center text-muted-foreground">
            Background Color
          </div>
          <div className="flex justify-center">
            <Popover
              open={openBackgroundColor}
              onOpenChange={setOpenBackgroundColor}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openBackgroundColor}
                  style={{ backgroundColor: props?.backgroundColor }}
                  className="w-[40px] justify-between"
                />
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 300 }}
                className="flex w-auto p-3 flex-col gap-3"
              >
                <HexColorPicker
                  color={props?.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e)}
                />
                <div className="flex gap-2 items-center ">
                  <Checkbox
                    checked={isBackgroundTransparent}
                    onCheckedChange={(e) =>
                      handleChange(
                        "backgroundColor",
                        e ? "transparent" : "#000000"
                      )
                    }
                  />
                  <Label>Transparent</Label>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center">
          <div className="text-md text-[#e4e4e7] font-medium flex items-center text-muted-foreground">
            Shadow Color
          </div>
          <div className="flex justify-center">
            <Popover open={openShadowColor} onOpenChange={setOpenShadowColor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openShadowColor}
                  style={{ backgroundColor: shadowColor }}
                  className="w-[40px] justify-between"
                />
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 300 }}
                className="flex w-auto p-3"
              >
                <HexColorPicker
                  color={shadowColor}
                  onChange={(e) => handleChange("textShadow", e)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="text-md text-[#e4e4e7] font-medium h-11 flex items-center text-muted-foreground">
          Opacity
        </div>
        <div className="grid grid-cols-4 items-center mx-4">
          <div className="flex">
            <Input
              className="w-[100%]"
              value={opacityPrev}
              onChange={(e) => validateString("opacity", e.target.value)}
              onBlur={() => handleChange("opacity", opacityPrev)}
              size="sm"
            />
          </div>
          <div className="flex justify-center col-span-3">
            <Slider
              defaultValue={[opacityPrev === "" ? 0 : Number(opacityPrev)]}
              value={[opacityPrev === "" ? 0 : Number(opacityPrev)]}
              onValueChange={(e) => handleChange("opacity", e[0])}
              max={100}
              step={1}
              className={cn("w-[60%]")}
            />
          </div>
        </div>

        <div className="text-md text-[#e4e4e7] font-medium h-11 flex items-center text-muted-foreground">
          Scale
        </div>
        <div className="grid grid-cols-4 items-center mx-4">
          <div className="flex">
            <Input
              className="w-[100%]"
              value={Math.round(Number(scalePrev))}
              onChange={(e) => validateString("scale", e.target.value)}
              onBlur={() => handleChange("transformScale", scalePrev)}
              size="sm"
            />
          </div>
          <div className="flex justify-center col-span-3">
            <Slider
              defaultValue={[scalePrev === "" ? 0 : Number(scalePrev)]}
              value={[scalePrev === "" ? 0 : Number(scalePrev)]}
              onValueChange={(e) => handleChange("transformScale", e[0])}
              max={500}
              min={0}
              step={1}
              className={cn("w-[60%]")}
            />
          </div>
        </div>

        <div className="text-md text-[#e4e4e7] font-medium h-11 flex items-center text-muted-foreground">
          Rotate
        </div>
        <div className="grid grid-cols-4 items-center mx-4">
          <div className="flex">
            <Input
              className="w-[100%]"
              value={Math.round(Number(rotatePrev))}
              onChange={(e) => validateString("rotate", e.target.value)}
              onBlur={() => handleChange("transformRotate", rotatePrev)}
              size="sm"
            />
          </div>
          <div className="flex justify-center col-span-3">
            <Slider
              defaultValue={[rotatePrev === "" ? 0 : Number(rotatePrev)]}
              value={[rotatePrev === "" ? 0 : Number(rotatePrev)]}
              onValueChange={(e) => handleChange("transformRotate", e[0])}
              max={360}
              min={0}
              step={1}
              className={cn("w-[60%]")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextProps;
