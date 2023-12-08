import { useDexStore } from '../store';
import { animated, useTransition } from '@react-spring/web';

export default function ActionSheet() {
  const actionSheetOpen = useDexStore((state) => state.actionSheetOpen);
  const setActionSheetOpen = useDexStore((state) => state.setActionSheetOpen);

  const transitions = useTransition(actionSheetOpen, {
    from: { opacity: 0, transform: 'translateY(100%)' },
    enter: { opacity: 1, transform: 'translateY(0%)' },
    leave: { opacity: 0, transform: 'translateY(100%)' },
  });

  return transitions(
    (style, item) =>
      item && (
        <>
          <animated.div
            style={{ opacity: style.opacity }}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-[2px]"
            onClick={() => {
              setActionSheetOpen(false);
            }}
          />
          <animated.div
            style={{ ...style, opacity: 1 }}
            className="flex fixed bottom-0 justify-center items-center w-full h-1/2 rounded-t-3xl bg-neutral-900"
          >
            ohh
          </animated.div>
        </>
      ),
  );
}